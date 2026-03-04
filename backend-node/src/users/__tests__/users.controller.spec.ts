import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { AuthGuard } from '@nestjs/passport';

/**
 * UsersController에 대한 단위 테스트입니다.
 * 내 프로필 조회, 특정 사용자 조회, 정보 수정, 회원 탈퇴 및 통계 조회 기능을 검증합니다.
 */
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

  describe('getProfile', () => {
    it('인증된 사용자의 프로필 정보를 반환해야 한다', async () => {
      const mockUser = { id: BigInt(1), nickname: '테스터' };
      (service.findUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.getProfile({ user: { id: BigInt(1) } });
      expect(result).toEqual(mockUser);
      expect(service.findUser).toHaveBeenCalledWith(BigInt(1));
    });
  });

  describe('getUser', () => {
    it('ID로 특정 사용자 정보를 조회해야 한다', async () => {
      const mockUser = { id: BigInt(2), nickname: '친구' };
      (service.findUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.getUser('2');
      expect(result).toEqual(mockUser);
      expect(service.findUser).toHaveBeenCalledWith('2');
    });
  });

  describe('updateUser', () => {
    it('사용자 정보를 수정하고 결과를 반환해야 한다', async () => {
      const dto = { nickname: '새닉네임' };
      (service.updateUser as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        ...dto,
      });

      const result = await controller.updateUser('1', dto);
      expect(result.nickname).toBe('새닉네임');
      expect(service.updateUser).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('deleteAccount', () => {
    it('인증 정보가 있으면 계정을 삭제하고 성공 메시지를 반환해야 한다', async () => {
      const req = { user: { userId: BigInt(1) } };
      const result = await controller.deleteAccount(req);

      expect(result.message).toContain('탈퇴가 완료되었습니다');
      expect(service.deleteUserAccount).toHaveBeenCalledWith(BigInt(1));
    });

    it('인증 정보가 없으면 에러 메시지를 반환해야 한다', async () => {
      const req = { user: null };
      const result = await controller.deleteAccount(req);

      expect(result.message).toContain('인증 정보를 확인할 수 없습니다');
      expect(service.deleteUserAccount).not.toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('사용자의 통계 정보를 조회해야 한다', async () => {
      const mockStats = { totalGames: 5, totalWinnings: BigInt(5000) };
      (service.getUserStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await controller.getUserStats('1');
      expect(result).toEqual(mockStats);
      expect(service.getUserStats).toHaveBeenCalledWith('1');
    });
  });
});
