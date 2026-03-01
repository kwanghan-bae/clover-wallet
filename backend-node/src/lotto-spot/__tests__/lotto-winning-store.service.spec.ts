import { Test, TestingModule } from '@nestjs/testing';
import { LottoWinningStoreService } from '../lotto-winning-store.service';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

jest.mock('axios');

describe('LottoWinningStoreService', () => {
  let service: LottoWinningStoreService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LottoWinningStoreService,
        {
          provide: PrismaService,
          useValue: {
            lottoWinningStore: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
            },
            $transaction: jest.fn((promises) => Promise.all(promises)),
          },
        },
      ],
    }).compile();

    service = module.get<LottoWinningStoreService>(LottoWinningStoreService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWinningStores', () => {
    it('should return winning stores for a round', async () => {
      const mockStores = [{ id: BigInt(1), round: 1150 }];
      (prisma.lottoWinningStore.findMany as jest.Mock).mockResolvedValue(mockStores);

      const result = await service.getWinningStores(1150);
      expect(result).toEqual(mockStores);
    });
  });

  describe('crawlWinningStores', () => {
    it('should skip if already exists', async () => {
      (prisma.lottoWinningStore.findFirst as jest.Mock).mockResolvedValue({ id: BigInt(1) });

      const result = await service.crawlWinningStores(1150);

      expect(result.count).toBe(0);
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
});
