import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

/**
 * @description AppModule의 정의 및 로드 여부를 확인하는 단위 테스트입니다.
 */
describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    process.env.DATABASE_URL = 'mock-database-url';
    process.env.SUPABASE_JWT_SECRET = 'mock-secret';
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
