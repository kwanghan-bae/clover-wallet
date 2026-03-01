import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * 모든 HTTP 예외를 처리하여 Kotlin의 CommonResponse.fail 규격으로 변환하는 전역 예외 필터입니다.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * 예외 발생 시 호출되어 에러 응답을 생성합니다.
   * @param exception 발생한 예외 객체
   * @param host 아규먼트 호스트 (HTTP 컨텍스트 추출용)
   */
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HTTP 상태 코드 결정
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 에러 메시지 결정
    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message || exception.message
        : '내부 서버 오류가 발생했습니다.';

    // 500 에러인 경우 에러 로그 기록, 그 외에는 경고 로그 기록
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - ${JSON.stringify(message)}`);
    }

    // Kotlin 규격에 맞춰 응답 반환
    response.status(status).json({
      success: false,
      data: null,
      message: Array.isArray(message) ? message[0] : message,
      timestamp: new Date().toISOString(),
    });
  }
}
