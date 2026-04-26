import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

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
    if (status === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json({
      success: false,
      data: null,
      message: Array.isArray(message) ? message[0] : message,
      timestamp: new Date().toISOString(),
    });
  }
}
