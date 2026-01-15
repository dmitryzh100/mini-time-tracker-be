import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@database/prisma/prisma.service';
import { AuthMessages } from '../constants';
import { JwtRefreshPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');

    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(
    payload: JwtRefreshPayload,
  ): Promise<{ id: number; email: string; tokenId: string }> {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(AuthMessages.invalidTokenType());
    }

    const token = await this.prisma.refreshToken.findUnique({
      where: { token: payload.tokenId },
    });

    if (
      !token ||
      token.userId !== payload.sub ||
      token.revokedAt ||
      token.expiresAt < new Date()
    ) {
      throw new UnauthorizedException(AuthMessages.invalidRefreshToken());
    }

    return { id: payload.sub, email: payload.email, tokenId: payload.tokenId };
  }
}
