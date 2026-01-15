import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '@database/prisma/prisma.service';
import { UsersService } from '@modules/users/users.service';
import { MailService } from '../../services/mail/mail.service';
import { AuthMessages } from './constants';
import type {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from './schemas';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from './interfaces/jwt-payload.interface';
import {
  AuthResponse,
  TokenResponse,
} from './interfaces/token-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async signUp(dto: SignUpDto): Promise<{ message: string }> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(AuthMessages.userExists());
    }

    const existingPending = await this.prisma.pendingRegistration.findUnique({
      where: { email: dto.email },
    });

    if (existingPending) {
      await this.prisma.pendingRegistration.delete({
        where: { id: existingPending.id },
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const verificationToken = randomUUID();
    const expirationHours = parseInt(
      this.configService.get<string>('EMAIL_VERIFICATION_EXPIRATION_HOURS') ||
        '24',
      10,
    );

    await this.prisma.pendingRegistration.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        token: verificationToken,
        expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
      },
    });

    await this.mailService.sendVerificationEmail(dto.email, verificationToken);

    return {
      message: AuthMessages.registrationSuccess(),
    };
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException(AuthMessages.invalidCredentials());
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthMessages.invalidCredentials());
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async refreshTokens(
    userId: number,
    email: string,
    oldTokenId: string,
  ): Promise<TokenResponse> {
    await this.prisma.refreshToken.update({
      where: { token: oldTokenId },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(userId, email);
  }

  async signOut(userId: number): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return { message: AuthMessages.signedOut() };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      return {
        message: AuthMessages.passwordResetSent(),
      };
    }

    const resetToken = randomUUID();
    const expirationHours = parseInt(
      this.configService.get<string>('PASSWORD_RESET_EXPIRATION_HOURS') || '1',
      10,
    );

    await this.prisma.passwordReset.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: AuthMessages.passwordResetSent(),
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (
      !passwordReset ||
      passwordReset.usedAt ||
      passwordReset.expiresAt < new Date()
    ) {
      throw new BadRequestException(AuthMessages.invalidResetToken());
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.usersService.updatePassword(passwordReset.userId, passwordHash);

    await this.prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { usedAt: new Date() },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: passwordReset.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return {
      message: AuthMessages.passwordResetSuccess(),
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const pendingRegistration =
      await this.prisma.pendingRegistration.findUnique({
        where: { token: dto.token },
      });

    if (!pendingRegistration || pendingRegistration.expiresAt < new Date()) {
      throw new BadRequestException(AuthMessages.invalidVerificationToken());
    }

    const existingUser = await this.usersService.findByEmail(
      pendingRegistration.email,
    );

    if (existingUser) {
      await this.prisma.pendingRegistration.delete({
        where: { id: pendingRegistration.id },
      });

      throw new ConflictException(AuthMessages.userExists());
    }

    await this.usersService.create({
      email: pendingRegistration.email,
      passwordHash: pendingRegistration.passwordHash,
      firstName: pendingRegistration.firstName,
      lastName: pendingRegistration.lastName,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });

    await this.prisma.pendingRegistration.delete({
      where: { id: pendingRegistration.id },
    });

    return { message: AuthMessages.emailVerified() };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      return {
        message: AuthMessages.resendVerificationSent(),
      };
    }

    const pendingRegistration =
      await this.prisma.pendingRegistration.findUnique({
        where: { email },
      });

    if (!pendingRegistration) {
      return {
        message: AuthMessages.resendVerificationSent(),
      };
    }

    const verificationToken = randomUUID();
    const expirationHours = parseInt(
      this.configService.get<string>('EMAIL_VERIFICATION_EXPIRATION_HOURS') ||
        '24',
      10,
    );

    await this.prisma.pendingRegistration.update({
      where: { id: pendingRegistration.id },
      data: {
        token: verificationToken,
        expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
      },
    });

    await this.mailService.sendVerificationEmail(email, verificationToken);

    return {
      message: AuthMessages.resendVerificationSent(),
    };
  }

  private async generateTokens(
    userId: number,
    email: string,
  ): Promise<TokenResponse> {
    const tokenId = randomUUID();

    const accessPayload: JwtAccessPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: userId,
      email,
      type: 'refresh',
      tokenId,
    };

    const accessToken = this.jwtService.sign(accessPayload);

    const refreshExpiration =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiration as unknown as number,
    });

    const expiresInMs = this.parseExpiration(refreshExpiration);

    await this.prisma.refreshToken.create({
      data: {
        token: tokenId,
        userId,
        expiresAt: new Date(Date.now() + expiresInMs),
      },
    });

    const accessExpiresIn = this.parseExpiration(
      this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(accessExpiresIn / 1000),
    };
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 15 * 60 * 1000;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 15 * 60 * 1000;
    }
  }
}
