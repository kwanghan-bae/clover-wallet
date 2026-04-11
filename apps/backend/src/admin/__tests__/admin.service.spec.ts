import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LottoWinningStoreService } from '../../lotto-spot/lotto-winning-store.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AdminService', () => {
  let service: AdminService;

  const mockPrisma = {
    winningInfo: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    lottoWinningStore: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockLottoWinningStoreService = {
    crawlWinningStores: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: LottoWinningStoreService,
          useValue: mockLottoWinningStoreService,
        },
        {
          provide: 'ConfigService',
          useValue: { get: jest.fn().mockReturnValue('test-key') },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('initializeWinningInfo', () => {
    it('should skip rounds that already exist', async () => {
      mockPrisma.winningInfo.findMany.mockResolvedValue([
        { round: 1 },
        { round: 2 },
      ]);
      mockedAxios.get.mockResolvedValue({
        data: {
          returnValue: 'success',
          drwNoDate: '2024-01-01',
          drwtNo1: 1,
          drwtNo2: 2,
          drwtNo3: 3,
          drwtNo4: 4,
          drwtNo5: 5,
          drwtNo6: 6,
          bnusNo: 7,
          firstWinamnt: 1000000000,
        },
      });

      await service.initializeWinningInfo(1, 3);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // only round 3
    });
  });

  describe('calculateCurrentRound', () => {
    it('should return a positive round number', () => {
      const round = service.calculateCurrentRound();
      expect(round).toBeGreaterThan(1000);
    });
  });
});
