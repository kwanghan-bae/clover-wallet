import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — 로컬 개발 시 Expo Web(8081), Metro DevTools(19006), 커스텀 origin 모두 허용.
  // prod 환경에선 CORS_ORIGINS env로 명시된 origin만 허용. unset이면 same-origin only.
  const isDev = process.env.NODE_ENV !== 'production';
  app.enableCors({
    origin: isDev
      ? true
      : (process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()) ?? false),
    credentials: true,
  });

  // 전역 API 접두어 설정 (v1 버전 관리)
  app.setGlobalPrefix('api/v1');

  // 유효성 검사 파이프 설정 (자동 변환 및 불필요 속성 제거)
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.useGlobalInterceptors(new TransformInterceptor());

  // BigInt 데이터 직렬화 처리를 위한 전역 인터셉터 설정
  app.useGlobalInterceptors(new BigIntInterceptor());

  app.useGlobalFilters(new GlobalExceptionFilter());

  // 지정된 포트(환경변수 또는 기본값 3000)에서 서버 실행
  await app.listen(process.env.PORT ?? 3000);
}

// 애플리케이션 부트스트랩 실행
bootstrap().catch((err) => {
  console.error('애플리케이션 구동 중 오류가 발생했습니다:', err);
  process.exit(1);
});
