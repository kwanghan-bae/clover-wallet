import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { AuthGuard } from '@nestjs/passport';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUserAccount: jest.fn(),
            getUserStats: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile from request', async () => {
      const mockUser = { id: BigInt(1), email: 'test@test.com' };
      (service.findUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.getProfile({ user: { id: BigInt(1) } });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUser', () => {
    it('should return user by id', async () => {
      const mockUser = { id: BigInt(1), email: 'test@test.com' };
      (service.findUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.getUser('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserStats', () => {
    it('should return user stats', async () => {
      const mockStats = { totalGames: 10, totalWinnings: BigInt(5000) };
      (service.getUserStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await controller.getUserStats('1');
      expect(result).toEqual(mockStats);
    });
  });
});
