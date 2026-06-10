import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectAccessService } from './project-access.service';

const projectInclude = {
  members: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly accessService: ProjectAccessService,
    private readonly prisma: PrismaService,
  ) {}

  async listProjects(user: AuthUser) {
    const projects = await this.prisma.project.findMany({
      where: this.accessService.isAdmin(user)
        ? { archivedAt: null }
        : {
            archivedAt: null,
            members: {
              some: {
                userId: user.id,
              },
            },
          },
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => this.toProjectResponse(project));
  }

  async createProject(user: AuthUser, dto: CreateProjectDto) {
    this.accessService.assertAdmin(user);
    await this.ensureKeyIsAvailable(dto.key);

    if (dto.memberIds?.length) {
      await this.ensureUsersExist(dto.memberIds);
    }

    const memberIds = [...new Set([user.id, ...(dto.memberIds ?? [])])];

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        key: dto.key.toUpperCase(),
        description: dto.description,
        members: {
          create: memberIds.map((userId) => ({
            userId,
            role: userId === user.id ? 'OWNER' : 'MEMBER',
          })),
        },
      },
      include: projectInclude,
    });

    return this.toProjectResponse(project);
  }

  async getProject(user: AuthUser, id: string) {
    await this.accessService.assertProjectAccess(user, id);
    const project = await this.findProjectOrThrow(id);

    return this.toProjectResponse(project);
  }

  async updateProject(user: AuthUser, id: string, dto: UpdateProjectDto) {
    this.accessService.assertAdmin(user);
    await this.findProjectOrThrow(id);

    if (dto.key) {
      await this.ensureKeyIsAvailable(dto.key, id);
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        key: dto.key?.toUpperCase(),
        description: dto.description,
      },
      include: projectInclude,
    });

    return this.toProjectResponse(project);
  }

  async archiveProject(user: AuthUser, id: string) {
    this.accessService.assertAdmin(user);
    await this.findProjectOrThrow(id);

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
      include: projectInclude,
    });

    return this.toProjectResponse(project);
  }

  async addMember(user: AuthUser, projectId: string, dto: AddProjectMemberDto) {
    this.accessService.assertAdmin(user);
    await this.findProjectOrThrow(projectId);
    await this.ensureUsersExist([dto.userId]);

    const member = await this.prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.userId,
        },
      },
      create: {
        projectId,
        userId: dto.userId,
        role: dto.role.toUpperCase(),
      },
      update: {
        role: dto.role.toUpperCase(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return this.toMemberResponse(member);
  }

  async updateMember(
    user: AuthUser,
    projectId: string,
    userId: string,
    dto: UpdateProjectMemberDto,
  ) {
    this.accessService.assertAdmin(user);
    await this.findProjectOrThrow(projectId);

    const member = await this.prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      data: {
        role: dto.role.toUpperCase(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return this.toMemberResponse(member);
  }

  async removeMember(user: AuthUser, projectId: string, userId: string) {
    this.accessService.assertAdmin(user);
    await this.findProjectOrThrow(projectId);

    await this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return { success: true };
  }

  private async findProjectOrThrow(id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        archivedAt: null,
      },
      include: projectInclude,
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  private async ensureKeyIsAvailable(key: string, ignoreProjectId?: string) {
    const existingProject = await this.prisma.project.findUnique({
      where: { key: key.toUpperCase() },
    });

    if (existingProject && existingProject.id !== ignoreProjectId) {
      throw new ConflictException('Project key already in use.');
    }
  }

  private async ensureUsersExist(userIds: string[]) {
    const uniqueUserIds = [...new Set(userIds)];
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: uniqueUserIds,
        },
        deletedAt: null,
        isActive: true,
      },
      select: { id: true },
    });

    if (users.length !== uniqueUserIds.length) {
      throw new NotFoundException('One or more users were not found.');
    }
  }

  private toProjectResponse(project: Prisma.ProjectGetPayload<{ include: typeof projectInclude }>) {
    return {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      archivedAt: project.archivedAt,
      members: project.members.map((member) => this.toMemberResponse(member)),
    };
  }

  private toMemberResponse(member: {
    userId: string;
    role: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      isActive: boolean;
    };
  }) {
    return {
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt,
      user: member.user,
    };
  }
}
