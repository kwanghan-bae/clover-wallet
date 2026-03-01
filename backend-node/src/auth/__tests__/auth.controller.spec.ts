import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should extract sub and email and call service.login', async () => {
      // Mocking a simple JWT payload part (header.payload.signature)
      const payload = Buffer.from(
        JSON.stringify({ sub: 'uuid-123', email: 'test@test.com' }),
      ).toString('base64');
      const mockToken = `header.${payload}.signature`;

      (service.login as jest.Mock).mockResolvedValue({ accessToken: 'at' });

      const result = await controller.login({ supabaseToken: mockToken });

      expect(service.login).toHaveBeenCalledWith('uuid-123', 'test@test.com');
      expect(result).toEqual({ accessToken: 'at' });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      await expect(
        controller.login({ supabaseToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should call service.refresh', async () => {
      (service.refresh as jest.Mock).mockResolvedValue({ accessToken: 'new-at' });

      const result = await controller.refresh({ refreshToken: 'rt' });

      expect(service.refresh).toHaveBeenCalledWith('rt');
      expect(result).toEqual({ accessToken: 'new-at' });
    });
  });

  describe('logout', () => {
    it('should call service.logout', async () => {
      await controller.logout('Bearer at', { refreshToken: 'rt' });

      expect(service.logout).toHaveBeenCalledWith('at', 'rt');
    });
  });
});
