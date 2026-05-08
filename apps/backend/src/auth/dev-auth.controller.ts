// apps/backend/src/auth/dev-auth.controller.ts
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * @description 로컬 개발 전용 로그인 컨트롤러.
 * NODE_ENV !== 'production' && DEV_AUTH_ENABLED='true'일 때만 AuthModule에 등록됨.
 * Supabase OAuth 우회 후 이메일로 user 찾기/생성 → 자체 JWT 발급.
 */
@Controller('auth')
export class DevAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('dev-login')
  async devLogin(@Body() body: { email: string }) {
    if (!body?.email) {
      throw new BadRequestException('email이 필요합니다');
    }
    return await this.authService.login(body.email, body.email);
  }
}
