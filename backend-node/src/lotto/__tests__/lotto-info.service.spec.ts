import { Test, TestingModule } from '@nestjs/testing';
import { LottoInfoService } from '../lotto-info.service';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LottoInfoService', () => {
  let service: LottoInfoService;

  const mockPrisma = {
    winningInfo: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LottoInfoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LottoInfoService>(LottoInfoService);
    jest.clearAllMocks();
  });

  describe('getNextDrawInfo', () => {
    it('should return next draw info with currentRound', async () => {
      mockPrisma.winningInfo.findFirst.mockResolvedValue({
        firstPrizeAmount: BigInt(3000000000),
      });
      const result = await service.getNextDrawInfo();
      expect(result).toHaveProperty('currentRound');
      expect(result).toHaveProperty('nextDrawDate');
      expect(result).toHaveProperty('daysLeft');
      expect(result.currentRound).toBeGreaterThan(1000);
    });
  });

  describe('getDrawResult', () => {
    it('should return draw result from DB', async () => {
      const mockInfo = {
        round: 1100,
        drawDate: new Date('2024-01-01'),
        number1: 1, number2: 2, number3: 3, number4: 4, number5: 5, number6: 6,
        bonusNumber: 7,
        firstPrizeAmount: BigInt(1000000000),
      };
      mockPrisma.winningInfo.findUnique.mockResolvedValue(mockInfo);
      const result = await service.getDrawResult(1100);
      expect(result).toEqual(expect.objectContaining({ round: 1100 }));
    });

    it('should return null for non-existent round', async () => {
      mockPrisma.winningInfo.findUnique.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({ data: { returnValue: 'fail' } });
      const result = await service.getDrawResult(99999);
      expect(result).toBeNull();
    });
  });
});
