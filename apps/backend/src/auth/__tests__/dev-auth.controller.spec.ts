// apps/backend/src/auth/__tests__/dev-auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { DevAuthController } from '../dev-auth.controller';
import { AuthService } from '../auth.service';
import { DevLoginDto } from '../dto/dev-login.dto';

/**
 * @description DevAuthController 단위 테스트.
 * 이메일 → ssoQualifier 변환 후 AuthService.login 호출되는지 검증.
 * 입력 검증은 DevLoginDto 레벨에서 class-validator로 보장됨.
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

      const dto = plainToInstance(DevLoginDto, { email: 'dev1@local.test' });
      const result = await controller.devLogin(dto);

      expect(service.login).toHaveBeenCalledWith(
        'dev1@local.test',
        'dev1@local.test',
      );
      expect(result).toEqual(expected);
    });
  });

  describe('DevLoginDto 검증', () => {
    it('빈 이메일은 DTO 검증에서 거부됨', async () => {
      const dto = plainToInstance(DevLoginDto, { email: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('잘못된 이메일 형식은 DTO 검증에서 거부됨', async () => {
      const dto = plainToInstance(DevLoginDto, { email: 'not-an-email' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.constraints?.isEmail)).toBe(true);
    });
  });
});
