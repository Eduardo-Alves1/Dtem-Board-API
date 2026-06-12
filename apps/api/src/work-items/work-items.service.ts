import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectAccessService } from '../projects/project-access.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { CreateWorkItemAttachmentDto } from './dto/create-work-item-attachment.dto';
import { CreateWorkItemCommentDto } from './dto/create-work-item-comment.dto';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { ListWorkItemsQueryDto } from './dto/list-work-items-query.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';

const workItemInclude = {
  type: true,
  status: true,
  assignee: {
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  updatedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  parent: {
    select: {
      id: true,
      title: true,
      typeId: true,
    },
  },
  children: {
    where: {
      archivedAt: null,
    },
    select: {
      id: true,
      title: true,
      typeId: true,
      type: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
      status: {
        select: {
          id: true,
          name: true,
          key: true,
          color: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  },
  _count: {
    select: {
      comments: true,
      attachments: true,
      historyEntries: true,
    },
  },
} satisfies Prisma.WorkItemInclude;

const commentInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.WorkItemCommentInclude;

const attachmentInclude = {
  uploadedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.WorkItemAttachmentInclude;

const historyInclude = {
  actor: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.WorkItemHistoryInclude;

type WorkItemWithInclude = Prisma.WorkItemGetPayload<{ include: typeof workItemInclude }>;

@Injectable()
export class WorkItemsService {
  constructor(
    private readonly accessService: ProjectAccessService,
    private readonly prisma: PrismaService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  async listWorkItems(user: AuthUser, projectId: string, query: ListWorkItemsQueryDto) {
    await this.accessService.assertProjectAccess(user, projectId);

    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where: Prisma.WorkItemWhereInput = {
      projectId,
      archivedAt: null,
      typeId: query.typeId,
      statusId: query.statusId,
      assigneeId: query.assigneeId,
      priority: query.priority?.toUpperCase(),
      tags: query.tag ? { has: query.tag } : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.workItem.findMany({
        where,
        include: workItemInclude,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.workItem.count({ where }),
    ]);

    return {
      data: items.map((item) => this.toWorkItemResponse(item)),
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  }

  async createWorkItem(user: AuthUser, projectId: string, dto: CreateWorkItemDto) {
    await this.accessService.assertProjectAccess(user, projectId);
    await this.ensureTypeEnabled(projectId, dto.typeId);
    await this.ensureAssigneeCanReceiveWork(projectId, dto.assigneeId);

    const statusId = dto.statusId ?? (await this.workflowsService.getInitialStatus(projectId)).id;
    await this.workflowsService.ensureStatusBelongsToProject(projectId, statusId);
    await this.validateParentHierarchy(projectId, dto.typeId, dto.parentId);

    const item = await this.prisma.workItem.create({
      data: {
        projectId,
        typeId: dto.typeId,
        statusId,
        parentId: dto.parentId,
        assigneeId: dto.assigneeId,
        createdById: user.id,
        title: dto.title,
        description: dto.description,
        acceptanceCriteria: dto.acceptanceCriteria,
        priority: dto.priority?.toUpperCase() ?? 'MEDIUM',
        estimate: dto.estimate,
        sprintKey: dto.sprintKey,
        tags: this.normalizeTags(dto.tags),
      },
      include: workItemInclude,
    });

    await this.recordHistory(item.id, user.id, 'CREATED');

    return this.toWorkItemResponse(item);
  }

  async getWorkItem(user: AuthUser, projectId: string, itemId: string) {
    await this.accessService.assertProjectAccess(user, projectId);
    const item = await this.findWorkItemOrThrow(projectId, itemId);

    return this.toWorkItemResponse(item);
  }

  async updateWorkItem(user: AuthUser, projectId: string, itemId: string, dto: UpdateWorkItemDto) {
    await this.accessService.assertProjectAccess(user, projectId);
    const currentItem = await this.findWorkItemOrThrow(projectId, itemId);

    const nextTypeId = dto.typeId ?? currentItem.typeId;
    const nextParentId = dto.parentId !== undefined ? dto.parentId : currentItem.parentId;

    if (dto.typeId) {
      await this.ensureTypeEnabled(projectId, dto.typeId);
    }

    if (dto.assigneeId !== undefined) {
      await this.ensureAssigneeCanReceiveWork(projectId, dto.assigneeId ?? undefined);
    }

    if (dto.statusId) {
      await this.workflowsService.ensureStatusBelongsToProject(projectId, dto.statusId);
      await this.workflowsService.assertTransitionAllowed(projectId, currentItem.statusId, dto.statusId);
    }

    await this.validateParentHierarchy(projectId, nextTypeId, nextParentId ?? undefined, itemId);

    const updatedItem = await this.prisma.workItem.update({
      where: { id: itemId },
      data: {
        typeId: dto.typeId,
        statusId: dto.statusId,
        parentId: dto.parentId !== undefined ? dto.parentId : undefined,
        assigneeId: dto.assigneeId !== undefined ? dto.assigneeId : undefined,
        updatedById: user.id,
        title: dto.title,
        description: dto.description !== undefined ? dto.description : undefined,
        acceptanceCriteria:
          dto.acceptanceCriteria !== undefined ? dto.acceptanceCriteria : undefined,
        priority: dto.priority?.toUpperCase(),
        estimate: dto.estimate !== undefined ? dto.estimate : undefined,
        sprintKey: dto.sprintKey !== undefined ? dto.sprintKey : undefined,
        tags: dto.tags ? this.normalizeTags(dto.tags) : undefined,
      },
      include: workItemInclude,
    });

    await this.recordChangedFields(currentItem, updatedItem, user.id);

    return this.toWorkItemResponse(updatedItem);
  }

  async archiveWorkItem(user: AuthUser, projectId: string, itemId: string) {
    await this.accessService.assertProjectAccess(user, projectId);
    await this.findWorkItemOrThrow(projectId, itemId);

    const archivedItem = await this.prisma.workItem.update({
      where: { id: itemId },
      data: {
        archivedAt: new Date(),
        updatedById: user.id,
      },
      include: workItemInclude,
    });

    await this.recordHistory(itemId, user.id, 'ARCHIVED');

    return this.toWorkItemResponse(archivedItem);
  }

  async listComments(user: AuthUser, projectId: string, itemId: string) {
    await this.ensureWorkItemAccess(user, projectId, itemId);

    return this.prisma.workItemComment.findMany({
      where: { workItemId: itemId, deletedAt: null },
      include: commentInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(
    user: AuthUser,
    projectId: string,
    itemId: string,
    dto: CreateWorkItemCommentDto,
  ) {
    await this.ensureWorkItemAccess(user, projectId, itemId);
    await this.ensureUsersExist(dto.mentions ?? []);

    const comment = await this.prisma.workItemComment.create({
      data: {
        workItemId: itemId,
        authorId: user.id,
        body: dto.body,
        mentions: [...new Set(dto.mentions ?? [])],
      },
      include: commentInclude,
    });

    await this.recordHistory(itemId, user.id, 'COMMENT_ADDED', 'commentId', null, comment.id);

    return comment;
  }

  async deleteComment(user: AuthUser, projectId: string, itemId: string, commentId: string) {
    await this.ensureWorkItemAccess(user, projectId, itemId);
    const comment = await this.prisma.workItemComment.findFirst({
      where: { id: commentId, workItemId: itemId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Work item comment not found.');
    }

    if (comment.authorId !== user.id && !this.accessService.isAdmin(user)) {
      this.accessService.assertAdmin(user);
    }

    await this.prisma.workItemComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
    await this.recordHistory(itemId, user.id, 'COMMENT_DELETED', 'commentId', commentId, null);

    return { success: true };
  }

  async listAttachments(user: AuthUser, projectId: string, itemId: string) {
    await this.ensureWorkItemAccess(user, projectId, itemId);

    return this.prisma.workItemAttachment.findMany({
      where: { workItemId: itemId, deletedAt: null },
      include: attachmentInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async addAttachment(
    user: AuthUser,
    projectId: string,
    itemId: string,
    dto: CreateWorkItemAttachmentDto,
  ) {
    await this.ensureWorkItemAccess(user, projectId, itemId);

    const attachment = await this.prisma.workItemAttachment.create({
      data: {
        workItemId: itemId,
        uploadedById: user.id,
        fileName: dto.fileName,
        contentType: dto.contentType,
        sizeBytes: dto.sizeBytes,
        storageKey: dto.storageKey,
        url: dto.url,
      },
      include: attachmentInclude,
    });

    await this.recordHistory(itemId, user.id, 'ATTACHMENT_ADDED', 'attachmentId', null, attachment.id);

    return attachment;
  }

  async deleteAttachment(user: AuthUser, projectId: string, itemId: string, attachmentId: string) {
    await this.ensureWorkItemAccess(user, projectId, itemId);
    const attachment = await this.prisma.workItemAttachment.findFirst({
      where: { id: attachmentId, workItemId: itemId, deletedAt: null },
    });

    if (!attachment) {
      throw new NotFoundException('Work item attachment not found.');
    }

    await this.prisma.workItemAttachment.update({
      where: { id: attachmentId },
      data: { deletedAt: new Date() },
    });
    await this.recordHistory(itemId, user.id, 'ATTACHMENT_DELETED', 'attachmentId', attachmentId, null);

    return { success: true };
  }

  async listHistory(user: AuthUser, projectId: string, itemId: string) {
    await this.ensureWorkItemAccess(user, projectId, itemId);

    return this.prisma.workItemHistory.findMany({
      where: { workItemId: itemId },
      include: historyInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  private async ensureWorkItemAccess(user: AuthUser, projectId: string, itemId: string) {
    await this.accessService.assertProjectAccess(user, projectId);
    await this.findWorkItemOrThrow(projectId, itemId);
  }

  private async findWorkItemOrThrow(projectId: string, itemId: string) {
    const item = await this.prisma.workItem.findFirst({
      where: { id: itemId, projectId, archivedAt: null },
      include: workItemInclude,
    });

    if (!item) {
      throw new NotFoundException('Work item not found.');
    }

    return item;
  }

  private async ensureTypeEnabled(projectId: string, typeId: string) {
    const projectType = await this.prisma.projectWorkItemType.findUnique({
      where: {
        projectId_workItemTypeId: {
          projectId,
          workItemTypeId: typeId,
        },
      },
      include: { workItemType: true },
    });

    if (!projectType?.isEnabled || !projectType.workItemType.isActive) {
      throw new NotFoundException('Work item type is not enabled for this project.');
    }
  }

  private async validateParentHierarchy(
    projectId: string,
    typeId: string,
    parentId?: string,
    itemId?: string,
  ) {
    if (parentId && parentId === itemId) {
      throw new ConflictException('Work item cannot be parent of itself.');
    }

    const hierarchyCount = await this.prisma.projectBacklogHierarchy.count({ where: { projectId } });

    if (hierarchyCount === 0) {
      return;
    }

    if (!parentId) {
      const rootMatch = await this.prisma.projectBacklogHierarchy.findFirst({
        where: { projectId, parentTypeId: null, childTypeId: typeId },
      });

      if (!rootMatch) {
        throw new ConflictException('Work item type requires a parent according to backlog hierarchy.');
      }

      return;
    }

    const parent = await this.prisma.workItem.findFirst({
      where: { id: parentId, projectId, archivedAt: null },
      select: { id: true, typeId: true },
    });

    if (!parent) {
      throw new NotFoundException('Parent work item not found.');
    }

    const hierarchyMatch = await this.prisma.projectBacklogHierarchy.findFirst({
      where: {
        projectId,
        parentTypeId: parent.typeId,
        childTypeId: typeId,
      },
    });

    if (!hierarchyMatch) {
      throw new ConflictException('Parent work item type is not allowed for this child type.');
    }
  }

  private async ensureAssigneeCanReceiveWork(projectId: string, assigneeId?: string | null) {
    if (!assigneeId) {
      return;
    }

    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: assigneeId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!membership || !membership.user.isActive || membership.user.deletedAt) {
      throw new NotFoundException('Assignee is not an active member of this project.');
    }
  }

  private async ensureUsersExist(userIds: string[]) {
    const uniqueUserIds = [...new Set(userIds)];

    if (!uniqueUserIds.length) {
      return;
    }

    const count = await this.prisma.user.count({
      where: {
        id: { in: uniqueUserIds },
        isActive: true,
        deletedAt: null,
      },
    });

    if (count !== uniqueUserIds.length) {
      throw new NotFoundException('One or more mentioned users were not found.');
    }
  }

  private async recordChangedFields(
    currentItem: WorkItemWithInclude,
    updatedItem: WorkItemWithInclude,
    actorId: string,
  ) {
    const fields: Array<keyof WorkItemWithInclude> = [
      'typeId',
      'statusId',
      'parentId',
      'assigneeId',
      'title',
      'description',
      'acceptanceCriteria',
      'priority',
      'estimate',
      'sprintKey',
      'tags',
    ];

    await Promise.all(
      fields
        .filter((field) => stringifyValue(currentItem[field]) !== stringifyValue(updatedItem[field]))
        .map((field) =>
          this.recordHistory(
            updatedItem.id,
            actorId,
            'UPDATED',
            String(field),
            stringifyValue(currentItem[field]),
            stringifyValue(updatedItem[field]),
          ),
        ),
    );
  }

  private async recordHistory(
    workItemId: string,
    actorId: string,
    action: string,
    field?: string,
    oldValue?: string | null,
    newValue?: string | null,
  ) {
    await this.prisma.workItemHistory.create({
      data: {
        workItemId,
        actorId,
        action,
        field,
        oldValue,
        newValue,
      },
    });
  }

  private normalizeTags(tags?: string[]) {
    return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
  }

  private toWorkItemResponse(item: WorkItemWithInclude) {
    return {
      id: item.id,
      projectId: item.projectId,
      type: item.type,
      status: item.status,
      parent: item.parent,
      children: item.children,
      assignee: item.assignee,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
      title: item.title,
      description: item.description,
      acceptanceCriteria: item.acceptanceCriteria,
      priority: item.priority,
      estimate: item.estimate,
      sprintKey: item.sprintKey,
      tags: item.tags,
      archivedAt: item.archivedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      counts: item._count,
    };
  }
}

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  return Array.isArray(value) ? JSON.stringify(value) : String(value);
}
