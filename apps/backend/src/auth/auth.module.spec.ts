/**
 * @file auth.module.spec.ts
 * @description AuthModule 정의 + dev 컨트롤러 게이팅 검증.
 *
 * 이 스펙은 모듈 로드 시점에 평가되는 process.env에 의존하므로
 * jest.resetModules() 직후 require() 로 모듈 정체성을 다시 맞춰야 합니다.
 * 따라서 파일 전체에 한해 no-require-imports 규칙을 비활성화합니다.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Test } from '@nestjs/testing';
describe('AuthModule', () => {
  // 모듈 캐시 초기화 헬퍼 — env 변경 후 AuthModule 재평가가 필요하므로
  // jest.resetModules() 후 같은 캐시 사이클에서 require로 토큰 정체성을 일치시킴.
  const loadModule = async () => {
    jest.resetModules();
    const { AuthModule } =
      require('./auth.module') as typeof import('./auth.module');
    const { PrismaService } =
      require('../prisma/prisma.service') as typeof import('../prisma/prisma.service');
    const { JwtService } =
      require('@nestjs/jwt') as typeof import('@nestjs/jwt');
    const { ConfigService } =
      require('@nestjs/config') as typeof import('@nestjs/config');
    return Test.createTestingModule({ imports: [AuthModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(JwtService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({ get: jest.fn().mockReturnValue('test-secret') })
      .compile();
  };

  describe('dev controller registration', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('NODE_ENV=production이면 DevAuthController 미등록', async () => {
      process.env.NODE_ENV = 'production';
      process.env.DEV_AUTH_ENABLED = 'true';
      const module = await loadModule();

      const { DevAuthController } =
        require('./dev-auth.controller') as typeof import('./dev-auth.controller');
      expect(() =>
        module.get<typeof DevAuthController>(DevAuthController),
      ).toThrow();
    });

    it('DEV_AUTH_ENABLED !== "true"이면 DevAuthController 미등록', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.DEV_AUTH_ENABLED;
      const module = await loadModule();

      const { DevAuthController } =
        require('./dev-auth.controller') as typeof import('./dev-auth.controller');
      expect(() =>
        module.get<typeof DevAuthController>(DevAuthController),
      ).toThrow();
    });

    it('두 조건 모두 충족 시 DevAuthController 등록', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DEV_AUTH_ENABLED = 'true';
      const module = await loadModule();

      const { DevAuthController } =
        require('./dev-auth.controller') as typeof import('./dev-auth.controller');
      expect(
        module.get<typeof DevAuthController>(DevAuthController),
      ).toBeDefined();
    });
  });
});
