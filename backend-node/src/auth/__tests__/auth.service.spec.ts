import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOrCreateBySsoQualifier: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            tokenBlacklist: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should create a user and return tokens', async () => {
      const mockUser = { id: BigInt(1), ssoQualifier: 'sub', email: 'test@test.com' };
      (usersService.findOrCreateBySsoQualifier as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login('sub', 'test@test.com');

      expect(usersService.findOrCreateBySsoQualifier).toHaveBeenCalledWith('sub', 'test@test.com');
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('refresh', () => {
    it('should return a new access token if refresh token is valid', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: '1' });
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        expiresAt: new Date(Date.now() + 10000),
      });

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException if token is invalid in DB', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: '1' });
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should add access token to blacklist and delete refresh token', async () => {
      (jwtService.decode as jest.Mock).mockReturnValue({ exp: 123456789 });

      await service.logout('access-token', 'refresh-token');

      expect(prisma.tokenBlacklist.create).toHaveBeenCalled();
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
      });
    });
  });
});
