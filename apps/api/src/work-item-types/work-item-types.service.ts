import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectAccessService } from '../projects/project-access.service';
import { ConfigureBacklogHierarchyDto } from './dto/configure-backlog-hierarchy.dto';
import { ConfigureProjectWorkItemTypesDto } from './dto/configure-project-work-item-types.dto';
import { CreateWorkItemTypeDto } from './dto/create-work-item-type.dto';
import { UpdateWorkItemTypeDto } from './dto/update-work-item-type.dto';

const defaultWorkItemTypes = [
  { name: 'Epic', description: 'Agrupador de alto nivel.', color: '#7C3AED', icon: 'EP' },
  { name: 'Feature', description: 'Funcionalidade do produto.', color: '#2563EB', icon: 'FT' },
  { name: 'User Story', description: 'Historia de usuario.', color: '#0284C7', icon: 'US' },
  { name: 'Task', description: 'Atividade tecnica.', color: '#16A34A', icon: 'TS' },
  { name: 'Bug', description: 'Defeito encontrado.', color: '#DC2626', icon: 'BG' },
  { name: 'Improvement', description: 'Melhoria incremental.', color: '#D97706', icon: 'IM' },
  { name: 'Spike', description: 'Investigacao tecnica.', color: '#52525B', icon: 'SP' },
];

const workItemTypeSelect = {
  id: true,
  name: true,
  description: true,
  color: true,
  icon: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.WorkItemTypeSelect;

@Injectable()
export class WorkItemTypesService {
  constructor(
    private readonly accessService: ProjectAccessService,
    private readonly prisma: PrismaService,
  ) {}

  async listWorkItemTypes() {
    await this.ensureDefaultWorkItemTypes();

    return this.prisma.workItemType.findMany({
      select: workItemTypeSelect,
      orderBy: { name: 'asc' },
    });
  }

  async createWorkItemType(user: AuthUser, dto: CreateWorkItemTypeDto) {
    this.accessService.assertAdmin(user);
    await this.ensureNameIsAvailable(dto.name);

    return this.prisma.workItemType.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
      },
      select: workItemTypeSelect,
    });
  }

  async updateWorkItemType(user: AuthUser, id: string, dto: UpdateWorkItemTypeDto) {
    this.accessService.assertAdmin(user);
    await this.ensureWorkItemTypeExists(id);

    if (dto.name) {
      await this.ensureNameIsAvailable(dto.name, id);
    }

    return this.prisma.workItemType.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        isActive: dto.isActive,
      },
      select: workItemTypeSelect,
    });
  }

  async archiveWorkItemType(user: AuthUser, id: string) {
    this.accessService.assertAdmin(user);
    await this.ensureWorkItemTypeExists(id);

    return this.prisma.workItemType.update({
      where: { id },
      data: { isActive: false },
      select: workItemTypeSelect,
    });
  }

  async listProjectWorkItemTypes(user: AuthUser, projectId: string) {
    await this.accessService.assertProjectAccess(user, projectId);
    await this.ensureDefaultProjectWorkItemTypes(projectId);

    const projectTypes = await this.prisma.projectWorkItemType.findMany({
      where: { projectId },
      include: { workItemType: { select: workItemTypeSelect } },
      orderBy: { workItemType: { name: 'asc' } },
    });

    return projectTypes.map((projectType) => ({
      ...projectType.workItemType,
      isEnabledForProject: projectType.isEnabled,
    }));
  }

  async configureProjectWorkItemTypes(
    user: AuthUser,
    projectId: string,
    dto: ConfigureProjectWorkItemTypesDto,
  ) {
    this.accessService.assertAdmin(user);
    await this.accessService.ensureProjectExists(projectId);
    await this.ensureWorkItemTypesExist(dto.workItemTypeIds);

    const uniqueIds = [...new Set(dto.workItemTypeIds)];

    await this.prisma.$transaction(async (transaction) => {
      await transaction.projectWorkItemType.deleteMany({ where: { projectId } });
      await transaction.projectWorkItemType.createMany({
        data: uniqueIds.map((workItemTypeId) => ({
          projectId,
          workItemTypeId,
          isEnabled: true,
        })),
        skipDuplicates: true,
      });
      await transaction.projectBacklogHierarchy.deleteMany({
        where: {
          projectId,
          OR: [
            { childTypeId: { notIn: uniqueIds } },
            { parentTypeId: { notIn: uniqueIds } },
          ],
        },
      });
    });

    return this.listProjectWorkItemTypes(user, projectId);
  }

  async getProjectBacklogHierarchy(user: AuthUser, projectId: string) {
    await this.accessService.assertProjectAccess(user, projectId);

    const hierarchy = await this.prisma.projectBacklogHierarchy.findMany({
      where: { projectId },
      include: {
        parentType: { select: workItemTypeSelect },
        childType: { select: workItemTypeSelect },
      },
      orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
    });

    return hierarchy.map((item) => ({
      id: item.id,
      level: item.level,
      parentType: item.parentType,
      childType: item.childType,
      createdAt: item.createdAt,
    }));
  }

  async configureProjectBacklogHierarchy(
    user: AuthUser,
    projectId: string,
    dto: ConfigureBacklogHierarchyDto,
  ) {
    this.accessService.assertAdmin(user);
    await this.accessService.ensureProjectExists(projectId);
    await this.ensureHierarchyTypesAreEnabled(projectId, dto);
    this.validateHierarchy(dto);

    await this.prisma.$transaction(async (transaction) => {
      await transaction.projectBacklogHierarchy.deleteMany({ where: { projectId } });
      await transaction.projectBacklogHierarchy.createMany({
        data: dto.hierarchy.map((item) => ({
          projectId,
          parentTypeId: item.parentTypeId,
          childTypeId: item.childTypeId,
          level: item.level,
        })),
      });
    });

    return this.getProjectBacklogHierarchy(user, projectId);
  }

  private async ensureDefaultWorkItemTypes() {
    await this.prisma.$transaction(
      defaultWorkItemTypes.map((type) =>
        this.prisma.workItemType.upsert({
          where: { name: type.name },
          update: {},
          create: type,
        }),
      ),
    );
  }

  private async ensureDefaultProjectWorkItemTypes(projectId: string) {
    await this.ensureDefaultWorkItemTypes();
    const existingCount = await this.prisma.projectWorkItemType.count({ where: { projectId } });

    if (existingCount > 0) {
      return;
    }

    const activeTypes = await this.prisma.workItemType.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    await this.prisma.projectWorkItemType.createMany({
      data: activeTypes.map((type) => ({
        projectId,
        workItemTypeId: type.id,
        isEnabled: true,
      })),
      skipDuplicates: true,
    });
  }

  private async ensureWorkItemTypeExists(id: string) {
    const workItemType = await this.prisma.workItemType.findUnique({ where: { id } });

    if (!workItemType) {
      throw new NotFoundException('Work item type not found.');
    }
  }

  private async ensureWorkItemTypesExist(ids: string[]) {
    const uniqueIds = [...new Set(ids)];
    const count = await this.prisma.workItemType.count({
      where: {
        id: { in: uniqueIds },
        isActive: true,
      },
    });

    if (count !== uniqueIds.length) {
      throw new NotFoundException('One or more work item types were not found.');
    }
  }

  private async ensureNameIsAvailable(name: string, ignoreId?: string) {
    const existingType = await this.prisma.workItemType.findUnique({
      where: { name },
    });

    if (existingType && existingType.id !== ignoreId) {
      throw new ConflictException('Work item type name already in use.');
    }
  }

  private async ensureHierarchyTypesAreEnabled(projectId: string, dto: ConfigureBacklogHierarchyDto) {
    const typeIds = [
      ...new Set(
        dto.hierarchy.flatMap((item) =>
          item.parentTypeId ? [item.parentTypeId, item.childTypeId] : [item.childTypeId],
        ),
      ),
    ];
    const enabledCount = await this.prisma.projectWorkItemType.count({
      where: {
        projectId,
        workItemTypeId: { in: typeIds },
        isEnabled: true,
      },
    });

    if (enabledCount !== typeIds.length) {
      throw new NotFoundException('Hierarchy contains work item types not enabled for project.');
    }
  }

  private validateHierarchy(dto: ConfigureBacklogHierarchyDto) {
    const childIds = new Set<string>();
    const roots = dto.hierarchy.filter((item) => !item.parentTypeId);

    if (roots.length !== 1) {
      throw new ConflictException('Backlog hierarchy must have exactly one root item.');
    }

    for (const item of dto.hierarchy) {
      if (childIds.has(item.childTypeId)) {
        throw new ConflictException('Each child type can appear only once in the hierarchy.');
      }

      if (item.parentTypeId === item.childTypeId) {
        throw new ConflictException('A work item type cannot be parent of itself.');
      }

      childIds.add(item.childTypeId);
    }
  }
}
