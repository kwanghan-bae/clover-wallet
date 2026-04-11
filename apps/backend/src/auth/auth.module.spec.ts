import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * @description AuthModule의 정의 및 의존성 로드 여부를 확인하는 단위 테스트입니다.
 */
describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(JwtService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockReturnValue('test-secret'),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(module.get<AuthService>(AuthService)).toBeDefined();
  });
});
