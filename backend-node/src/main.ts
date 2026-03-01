import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

/**
 * NestJS 애플리케이션을 초기화하고 구동하는 엔트리포인트 함수입니다.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 API 접두어 설정 (v1 버전 관리)
  app.setGlobalPrefix('api/v1');

  // 유효성 검사 파이프 설정 (자동 변환 및 불필요 속성 제거)
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // 응답 변환 인터셉터 (Kotlin CommonResponse 규격 준수)
  app.useGlobalInterceptors(new TransformInterceptor());

  // BigInt 데이터 직렬화 처리를 위한 전역 인터셉터 설정
  app.useGlobalInterceptors(new BigIntInterceptor());

  // 전역 예외 필터 설정 (Kotlin 에러 규격 준수)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 지정된 포트(환경변수 또는 기본값 3000)에서 서버 실행
  await app.listen(process.env.PORT ?? 3000);
}

// 애플리케이션 부트스트랩 실행
bootstrap();
