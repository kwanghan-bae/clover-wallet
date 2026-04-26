import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET') ?? '',
    });
  }

  /** JWT 페이로드에서 사용자 정보를 추출하여 검증합니다. */
  validate(payload: any) {
    // Supabase JWT 페이로드에는 'sub' (user_id) 및 'email' 등이 포함됩니다.
    // 여기서 반환된 객체는 Request 객체의 'user' 필드에 주입됩니다.
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
