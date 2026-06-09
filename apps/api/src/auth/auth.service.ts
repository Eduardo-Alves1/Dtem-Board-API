import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenHashService } from './token-hash.service';
import { AuthTokens, AuthUser, JwtPayload } from './auth.types';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { LoginDto } from './dto/login.dto';

const adminRoleName = 'ADMIN';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly prisma: PrismaService,
    private readonly tokenHashService: TokenHashService,
  ) {}

  async bootstrapAdmin(dto: BootstrapAdminDto) {
    const adminRole = await this.prisma.role.findUnique({
      where: { name: adminRoleName },
      include: { users: true },
    });

    if (adminRole?.users.length) {
      throw new ConflictException('Admin user already exists.');
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);
    const role = adminRole ?? (await this.prisma.role.create({ data: { name: adminRoleName } }));

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        roles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: { roles: { include: { role: true } } },
    });

    return this.createSession(this.toAuthUser(user));
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        deletedAt: null,
        isActive: true,
      },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !(await this.passwordService.verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.createSession(this.toAuthUser(user));
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.tokenHashService.hash(refreshToken);
    const persistedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });

    if (
      !persistedToken ||
      persistedToken.revokedAt ||
      persistedToken.expiresAt.getTime() <= Date.now() ||
      persistedToken.user.deletedAt ||
      !persistedToken.user.isActive
    ) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    await this.prisma.refreshToken.update({
      where: { id: persistedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.createSession(this.toAuthUser(persistedToken.user));
  }

  async logout(refreshToken: string) {
    const tokenHash = this.tokenHashService.hash(refreshToken);
    const persistedToken = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!persistedToken) {
      throw new NotFoundException('Refresh token not found.');
    }

    await this.prisma.refreshToken.update({
      where: { id: persistedToken.id },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  private async createSession(user: AuthUser): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);
    const refreshTokenHash = this.tokenHashService.hash(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: this.getRefreshTokenExpirationDate(),
      },
    });

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  private async signAccessToken(user: AuthUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_EXPIRES_IN',
        '15m',
      ) as SignOptions['expiresIn'],
    });
  }

  private async signRefreshToken(user: AuthUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ) as SignOptions['expiresIn'],
    });
  }

  private getRefreshTokenExpirationDate() {
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const match = expiresIn.match(/^(\d+)([dhm])$/);

    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const milliseconds =
      unit === 'd'
        ? amount * 24 * 60 * 60 * 1000
        : unit === 'h'
          ? amount * 60 * 60 * 1000
          : amount * 60 * 1000;

    return new Date(Date.now() + milliseconds);
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    name: string;
    roles: { role: { name: string } }[];
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((userRole) => userRole.role.name),
    };
  }
}
