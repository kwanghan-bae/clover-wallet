import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * 백엔드에서 자체 발급한 JWT를 검증하는 전략 클래스입니다.
 */
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

  /**
   * 토큰 검증 성공 시 호출되어 사용자 정보를 Request 객체에 주입합니다.
   * @param payload 디코딩된 JWT 페이로드
   * @returns 사용자 식별 정보
   */
  async validate(payload: any) {
    // sub 클레임에 저장된 DB 사용자 ID 반환
    return { id: BigInt(payload.sub) };
  }
}
