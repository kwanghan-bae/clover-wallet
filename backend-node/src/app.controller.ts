import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';

/**
 * 어플리케이션의 기본 엔트리포인트를 담당하는 컨트롤러입니다.
 * 헬스체크 및 기본적인 인증 테스트 기능을 제공합니다.
 */
@Controller()
export class AppController {
  /**
   * 앱 서비스 의존성을 주입받습니다.
   * @param appService 앱의 핵심 로직을 처리하는 서비스
   */
  constructor(private readonly appService: AppService) { }

  /**
   * 기본적인 인사말을 반환하는 헬스체크용 엔드포인트입니다.
   * @returns "Hello World!" 문자열
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * JWT 인증이 정상적으로 작동하는지 확인하기 위한 테스트 엔드포인트입니다.
   * @param req 인증된 사용자 정보가 포함된 요청 객체
   * @returns 인증 성공 메시지와 사용자 정보
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('auth-test')
  getProfile(@Request() req: any) {
    return {
      message: 'Authenticated successfully with NestJS!',
      user: req.user,
    };
  }
}
