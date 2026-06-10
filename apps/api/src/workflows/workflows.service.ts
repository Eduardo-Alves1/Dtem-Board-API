import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectAccessService } from '../projects/project-access.service';
import { CreateWorkflowStatusDto } from './dto/create-workflow-status.dto';
import { CreateWorkflowTransitionDto } from './dto/create-workflow-transition.dto';
import { UpdateWorkflowStatusDto } from './dto/update-workflow-status.dto';

const defaultStatuses = [
  { name: 'To Do', key: 'TODO', color: '#64748B', order: 0, isInitial: true, isFinal: false },
  {
    name: 'In Progress',
    key: 'IN_PROGRESS',
    color: '#2563EB',
    order: 1,
    isInitial: false,
    isFinal: false,
  },
  { name: 'Done', key: 'DONE', color: '#16A34A', order: 2, isInitial: false, isFinal: true },
];

const workflowStatusSelect = {
  id: true,
  projectId: true,
  name: true,
  key: true,
  color: true,
  order: true,
  isInitial: true,
  isFinal: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.WorkflowStatusSelect;

const workflowTransitionSelect = {
  id: true,
  projectId: true,
  name: true,
  createdAt: true,
  fromStatus: { select: workflowStatusSelect },
  toStatus: { select: workflowStatusSelect },
} satisfies Prisma.WorkflowTransitionSelect;

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly accessService: ProjectAccessService,
    private readonly prisma: PrismaService,
  ) {}

  async listStatuses(user: AuthUser, projectId: string) {
    await this.accessService.assertProjectAccess(user, projectId);
    await this.ensureDefaultWorkflow(projectId);

    return this.prisma.workflowStatus.findMany({
      where: { projectId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: workflowStatusSelect,
    });
  }

  async createStatus(user: AuthUser, projectId: string, dto: CreateWorkflowStatusDto) {
    this.accessService.assertAdmin(user);
    await this.accessService.ensureProjectExists(projectId);
    await this.ensureStatusKeyIsAvailable(projectId, dto.key);

    if (dto.isInitial) {
      await this.clearInitialStatus(projectId);
    }

    return this.prisma.workflowStatus.create({
      data: {
        projectId,
        name: dto.name,
        key: dto.key.toUpperCase(),
        color: dto.color,
        order: dto.order ?? 0,
        isInitial: dto.isInitial ?? false,
        isFinal: dto.isFinal ?? false,
      },
      select: workflowStatusSelect,
    });
  }

  async updateStatus(
    user: AuthUser,
    projectId: string,
    statusId: string,
    dto: UpdateWorkflowStatusDto,
  ) {
    this.accessService.assertAdmin(user);
    await this.accessService.ensureProjectExists(projectId);
    await this.ensureStatusExists(projectId, statusId);

    if (dto.key) {
      await this.ensureStatusKeyIsAvailable(projectId, dto.key, statusId);
    }

    if (dto.isInitial) {
      await this.clearInitialStatus(projectId, statusId);
    }

    return this.prisma.workflowStatus.update({
      where: { id: statusId },
      data: {
        name: dto.name,
        key: dto.key?.toUpperCase(),
        color: dto.color,
        order: dto.order,
        isInitial: dto.isInitial,
        isFinal: dto.isFinal,
      },
      select: workflowStatusSelect,
    });
  }

  async deleteStatus(user: AuthUser, projectId: string, statusId: string) {
    this.accessService.assertAdmin(user);
    await this.accessService.ensureProjectExists(projectId);
    const status = await this.ensureStatusExists(projectId, statusId);

    const workItemCount = await this.prisma.workItem.count({
      where: { projectId, statusId, archivedAt: null },
    });

    if (workItemCount > 0) {
      throw new ConflictException('Workflow status is used by active work items.');
    }

    if (status.isInitial) {
      throw new ConflictException('Initial workflow status cannot be removed.');
    }

    await this.prisma.workflowStatus.delete({ where: { id: statusId } });

    return { success: true };
  }

  async listTransitions(user: AuthUser, projectId: string) {
    await this.accessService.assertProjectAccess(user, projectId);
    await this.ensureDefaultWorkflow(projectId);

    const transitions = await this.prisma.workflowTransition.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      select: workflowTransitionSelect,
    });

    return transitions.map((transition) => this.toTransitionResponse(transition));
  }

  async createTransition(user: AuthUser, projectId: string, dto: CreateWorkflowTransitionDto) {
    this.accessService.assertAdmin(user);
    await this.accessService.ensureProjectExists(projectId);
    await this.ensureStatusExists(projectId, dto.fromStatusId);
    await this.ensureStatusExists(projectId, dto.toStatusId);

    if (dto.fromStatusId === dto.toStatusId) {
      throw new ConflictException('Workflow transition must change status.');
    }

    const transition = await this.prisma.workflowTransition.create({
      data: {
        projectId,
        fromStatusId: dto.fromStatusId,
        toStatusId: dto.toStatusId,
        name: dto.name,
      },
      select: workflowTransitionSelect,
    });

    return this.toTransitionResponse(transition);
  }

  async deleteTransition(user: AuthUser, projectId: string, transitionId: string) {
    this.accessService.assertAdmin(user);
    await this.accessService.ensureProjectExists(projectId);

    const transition = await this.prisma.workflowTransition.findFirst({
      where: { id: transitionId, projectId },
    });

    if (!transition) {
      throw new NotFoundException('Workflow transition not found.');
    }

    await this.prisma.workflowTransition.delete({ where: { id: transitionId } });

    return { success: true };
  }

  async getInitialStatus(projectId: string) {
    await this.ensureDefaultWorkflow(projectId);

    const status = await this.prisma.workflowStatus.findFirst({
      where: { projectId, isInitial: true },
      select: workflowStatusSelect,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    if (!status) {
      throw new ConflictException('Project workflow does not have an initial status.');
    }

    return status;
  }

  async ensureStatusBelongsToProject(projectId: string, statusId: string) {
    return this.ensureStatusExists(projectId, statusId);
  }

  async assertTransitionAllowed(projectId: string, fromStatusId: string, toStatusId: string) {
    if (fromStatusId === toStatusId) {
      return;
    }

    const transition = await this.prisma.workflowTransition.findUnique({
      where: {
        projectId_fromStatusId_toStatusId: {
          projectId,
          fromStatusId,
          toStatusId,
        },
      },
    });

    if (!transition) {
      throw new ConflictException('Workflow transition is not allowed.');
    }
  }

  async ensureDefaultWorkflow(projectId: string) {
    const existingStatusCount = await this.prisma.workflowStatus.count({ where: { projectId } });

    if (existingStatusCount > 0) {
      return;
    }

    await this.prisma.$transaction(async (transaction) => {
      const createdStatuses = await Promise.all(
        defaultStatuses.map((status) =>
          transaction.workflowStatus.create({
            data: {
              projectId,
              name: status.name,
              key: status.key,
              color: status.color,
              order: status.order,
              isInitial: status.isInitial,
              isFinal: status.isFinal,
            },
          }),
        ),
      );

      const todo = createdStatuses.find((status) => status.key === 'TODO');
      const inProgress = createdStatuses.find((status) => status.key === 'IN_PROGRESS');
      const done = createdStatuses.find((status) => status.key === 'DONE');

      if (!todo || !inProgress || !done) {
        return;
      }

      await transaction.workflowTransition.createMany({
        data: [
          {
            projectId,
            fromStatusId: todo.id,
            toStatusId: inProgress.id,
            name: 'Start progress',
          },
          {
            projectId,
            fromStatusId: inProgress.id,
            toStatusId: done.id,
            name: 'Finish work',
          },
        ],
        skipDuplicates: true,
      });
    });
  }

  private async ensureStatusExists(projectId: string, statusId: string) {
    const status = await this.prisma.workflowStatus.findFirst({
      where: { id: statusId, projectId },
      select: workflowStatusSelect,
    });

    if (!status) {
      throw new NotFoundException('Workflow status not found.');
    }

    return status;
  }

  private async ensureStatusKeyIsAvailable(projectId: string, key: string, ignoreStatusId?: string) {
    const existingStatus = await this.prisma.workflowStatus.findUnique({
      where: {
        projectId_key: {
          projectId,
          key: key.toUpperCase(),
        },
      },
    });

    if (existingStatus && existingStatus.id !== ignoreStatusId) {
      throw new ConflictException('Workflow status key already in use.');
    }
  }

  private async clearInitialStatus(projectId: string, ignoreStatusId?: string) {
    await this.prisma.workflowStatus.updateMany({
      where: {
        projectId,
        isInitial: true,
        id: ignoreStatusId ? { not: ignoreStatusId } : undefined,
      },
      data: { isInitial: false },
    });
  }

  private toTransitionResponse(
    transition: Prisma.WorkflowTransitionGetPayload<{ select: typeof workflowTransitionSelect }>,
  ) {
    return {
      id: transition.id,
      projectId: transition.projectId,
      name: transition.name,
      fromStatus: transition.fromStatus,
      toStatus: transition.toStatus,
      createdAt: transition.createdAt,
    };
  }
}
