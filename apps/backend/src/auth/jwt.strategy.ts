import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      /// Authorization 헤더의 Bearer 토큰에서 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      /// 만료된 토큰 거부
      ignoreExpiration: false,
      /// 서명 검증을 위한 비밀키 (환경변수 관리 권장)
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'defaultSecret',
    });
  }

  validate(payload: any) {
    // sub 클레임에 저장된 DB 사용자 ID 반환
    return { id: BigInt(payload.sub) };
  }
}
