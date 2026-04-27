import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,

      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const authorizationHeader = req.get('Authorization');

    if (!authorizationHeader) {
      throw new ForbiddenException('Không tìm thấy Refresh Token');
    }

    const refreshToken = authorizationHeader.replace('Bearer', '').trim();

    return {
      ...payload,
      refreshToken: refreshToken,
    };
  }
}
