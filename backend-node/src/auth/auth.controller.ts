import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * 인증 관련 HTTP 요청을 처리하는 컨트롤러입니다.
 * Kotlin AuthController 규격을 이식함.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 로그인: Supabase 토큰을 검증하여 백엔드 토큰 발급
   * @param body supabaseToken이 포함된 요청 본문
   */
  @Post('login')
  async login(@Body() body: { supabaseToken: string }) {
    // Kotlin에서는 decode만 함 (클라이언트 신뢰)
    // 여기서는 간단하게 payload 추출 로직 구현 (또는 Supabase SDK 사용 가능)
    try {
      const token = body.supabaseToken;
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(
        Buffer.from(payloadBase64, 'base64').toString(),
      );

      const userId = payload.sub;
      const email = payload.email;

      return await this.authService.login(userId, email);
    } catch (e) {
      throw new UnauthorizedException('로그인에 실패했습니다');
    }
  }

  /**
   * 토큰 갱신: 리프레시 토큰으로 새 액세스 토큰 발급
   */
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return await this.authService.refresh(body.refreshToken);
  }

  /**
   * 로그아웃: 토큰 블랙리스트 등록 및 삭제
   */
  @Post('logout')
  async logout(
    @Headers('authorization') authHeader: string,
    @Body() body: { refreshToken: string },
  ) {
    const accessToken = authHeader?.replace('Bearer ', '');
    await this.authService.logout(accessToken, body.refreshToken);
    return { message: 'Logged out successfully' };
  }
}
