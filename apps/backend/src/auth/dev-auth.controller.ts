// apps/backend/src/auth/dev-auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DevLoginDto } from './dto/dev-login.dto';

/**
 * @description 로컬 개발 전용 로그인 컨트롤러.
 * 등록 조건은 `auth.module.ts`의 `isDevAuthEnabled` 게이트가 source-of-truth.
 * 컨트롤러 자체는 게이트를 모르므로, 등록되어 있다 = 활성 상태.
 */
@Controller('auth')
export class DevAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('dev-login')
  async devLogin(@Body() body: DevLoginDto) {
    return await this.authService.login(body.email, body.email);
  }
}
