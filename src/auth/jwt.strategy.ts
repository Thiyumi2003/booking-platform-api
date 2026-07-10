import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export function extractJwtTokenFromHeader(authHeader?: string): string | null {
  if (typeof authHeader !== 'string') {
    return null;
  }

  let token = authHeader.trim();
  while (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim();
  }

  return token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req) => {
        const authHeader = req?.headers?.authorization;
        const tokenFromHeader = extractJwtTokenFromHeader(authHeader);
        if (tokenFromHeader) {
          return tokenFromHeader;
        }

        const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (bearerToken) {
          return extractJwtTokenFromHeader(bearerToken);
        }

        return null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwtSecret') ?? 'your-super-secret-key',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
