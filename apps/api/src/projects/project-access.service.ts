import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectAccessService {
  constructor(private readonly prisma: PrismaService) {}

  isAdmin(user: AuthUser) {
    return user.roles.includes('ADMIN');
  }

  assertAdmin(user: AuthUser) {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Admin role is required.');
    }
  }

  async assertProjectAccess(user: AuthUser, projectId: string) {
    if (this.isAdmin(user)) {
      await this.ensureProjectExists(projectId);
      return;
    }

    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
      include: {
        project: true,
      },
    });

    if (!membership || membership.project.archivedAt) {
      throw new ForbiddenException('Project access denied.');
    }
  }

  async ensureProjectExists(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        archivedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }
}
