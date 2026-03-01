import { Test, TestingModule } from '@nestjs/testing';
import { LottoSpotService } from '../lotto-spot.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LottoSpotService', () => {
  let service: LottoSpotService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LottoSpotService,
        {
          provide: PrismaService,
          useValue: {
            lottoSpot: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LottoSpotService>(LottoSpotService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllLottoSpots', () => {
    it('should return paginated spots', async () => {
      (prisma.lottoSpot.findMany as jest.Mock).mockResolvedValue([{ id: BigInt(1) }]);
      (prisma.lottoSpot.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getAllLottoSpots(0, 20);

      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });
  });

  describe('searchByName', () => {
    it('should return matching spots', async () => {
      const mockSpots = [{ id: BigInt(1), name: 'Spot A' }];
      (prisma.lottoSpot.findMany as jest.Mock).mockResolvedValue(mockSpots);

      const result = await service.searchByName('Spot');
      expect(result).toEqual(mockSpots);
    });
  });

  describe('getSpotById', () => {
    it('should return a spot by id', async () => {
      const mockSpot = { id: BigInt(1), name: 'Spot A' };
      (prisma.lottoSpot.findUnique as jest.Mock).mockResolvedValue(mockSpot);

      const result = await service.getSpotById(BigInt(1));
      expect(result).toEqual(mockSpot);
    });
  });
});
