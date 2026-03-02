import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 애플리케이션의 기본 엔드포인트를 처리하는 컨트롤러입니다.
 */
@Controller()
export class AppController {
  /**
   * AppController 생성자
   * @param appService AppService 주입
   */
  constructor(private readonly appService: AppService) {}

  /**
   * 애플리케이션의 헬스체크 또는 인사말을 반환합니다.
   * @returns "Hello World!" 문자열
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
