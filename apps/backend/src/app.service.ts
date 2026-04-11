import { Injectable } from '@nestjs/common';

/**
 * 어플리케이션의 핵심 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Injectable()
export class AppService {
  /**
   * 기본적인 인사말 문자열을 생성하여 반환합니다.
   * @returns "Hello World!" 문자열
   */
  getHello(): string {
    return 'Hello World!';
  }
}
