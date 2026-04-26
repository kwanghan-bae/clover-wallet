import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { supabaseToken: string }) {
    try {
      const token = body.supabaseToken;
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(
        Buffer.from(payloadBase64, 'base64').toString(),
      );

      const userId = payload.sub;
      const email = payload.email;

      return await this.authService.login(userId, email);
    } catch (_e) {
      throw new UnauthorizedException('로그인에 실패했습니다');
    }
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return await this.authService.refresh(body.refreshToken);
  }

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
