import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './jwt.constants';

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
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (bearerToken) {
          return bearerToken;
        }

        return extractJwtTokenFromHeader(req?.headers?.authorization);
      },
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
