// apps/backend/src/auth/__tests__/dev-auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DevAuthController } from '../dev-auth.controller';
import { AuthService } from '../auth.service';

/**
 * @description DevAuthController 단위 테스트.
 * 이메일 → ssoQualifier 변환 후 AuthService.login 호출되는지 검증.
 */
describe('DevAuthController', () => {
  let controller: DevAuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevAuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { login: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<DevAuthController>(DevAuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('devLogin', () => {
    it('이메일을 ssoQualifier로 변환해 AuthService.login 호출', async () => {
      const expected = {
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: BigInt(1) },
      };
      (service.login as jest.Mock).mockResolvedValue(expected);

      const result = await controller.devLogin({ email: 'dev1@local.test' });

      expect(service.login).toHaveBeenCalledWith(
        'dev1@local.test',
        'dev1@local.test',
      );
      expect(result).toEqual(expected);
    });

    it('빈 이메일이면 BadRequest 던짐', async () => {
      await expect(controller.devLogin({ email: '' })).rejects.toThrow();
    });
  });
});
