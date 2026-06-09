import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export const defaultRoleNames = [
  'ADMIN',
  'PRODUCT_OWNER',
  'SCRUM_MASTER',
  'DEVELOPER',
  'QA',
  'STAKEHOLDER',
  'VIEWER',
];

const userInclude = {
  roles: {
    include: {
      role: true,
    },
  },
} satisfies Prisma.UserInclude;

@Injectable()
export class UsersService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly prisma: PrismaService,
  ) {}

  async listUsers() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: userInclude,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toUserResponse(user));
  }

  async getUser(id: string) {
    const user = await this.findUserOrThrow(id);

    return this.toUserResponse(user);
  }

  async createUser(dto: CreateUserDto) {
    await this.ensureEmailIsAvailable(dto.email);
    await this.ensureDefaultRoles();

    const roleNames = dto.roles?.length ? dto.roles : ['VIEWER'];
    const roles = await this.findRolesByName(roleNames);
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        roles: {
          create: roles.map((role) => ({
            roleId: role.id,
          })),
        },
      },
      include: userInclude,
    });

    return this.toUserResponse(user);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    await this.findUserOrThrow(id);

    if (dto.email) {
      await this.ensureEmailIsAvailable(dto.email, id);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email?.toLowerCase(),
        isActive: dto.isActive,
      },
      include: userInclude,
    });

    return this.toUserResponse(user);
  }

  async assignRoles(id: string, dto: AssignRolesDto) {
    await this.findUserOrThrow(id);
    await this.ensureDefaultRoles();
    const roles = await this.findRolesByName(dto.roles);

    const user = await this.prisma.$transaction(async (transaction) => {
      await transaction.userRole.deleteMany({ where: { userId: id } });
      await transaction.userRole.createMany({
        data: roles.map((role) => ({
          userId: id,
          roleId: role.id,
        })),
        skipDuplicates: true,
      });

      return transaction.user.findUniqueOrThrow({
        where: { id },
        include: userInclude,
      });
    });

    return this.toUserResponse(user);
  }

  async archiveUser(id: string) {
    await this.findUserOrThrow(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        refreshTokens: {
          updateMany: {
            where: { revokedAt: null },
            data: { revokedAt: new Date() },
          },
        },
      },
      include: userInclude,
    });

    return this.toUserResponse(user);
  }

  async listRoles() {
    await this.ensureDefaultRoles();

    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }

  private async ensureDefaultRoles() {
    await this.prisma.$transaction(
      defaultRoleNames.map((name) =>
        this.prisma.role.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );
  }

  private async findUserOrThrow(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: userInclude,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  private async findRolesByName(names: string[]) {
    const normalizedNames = [...new Set(names.map((name) => name.trim().toUpperCase()))];
    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          in: normalizedNames,
        },
      },
    });

    if (roles.length !== normalizedNames.length) {
      const foundNames = new Set(roles.map((role) => role.name));
      const missingNames = normalizedNames.filter((name) => !foundNames.has(name));

      throw new NotFoundException(`Roles not found: ${missingNames.join(', ')}`);
    }

    return roles;
  }

  private async ensureEmailIsAvailable(email: string, ignoreUserId?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser && existingUser.id !== ignoreUserId) {
      throw new ConflictException('Email already in use.');
    }
  }

  private toUserResponse(user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    roles: { role: { name: string } }[];
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      roles: user.roles.map((userRole) => userRole.role.name),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
