import { Test, TestingModule } from '@nestjs/testing';
import { LottoWinningStoreService } from '../lotto-winning-store.service';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';
import * as iconv from 'iconv-lite';

jest.mock('axios');
/** axios 모듈을 jest Mock 객체로 캐스팅하여 타입 안정성을 확보하고 API 호출을 시뮬레이션합니다. */
const mockedAxios = axios as jest.Mocked<typeof axios>;

/**
 * LottoWinningStoreService에 대한 단위 테스트입니다.
 * 로또 당첨 판매점 정보 조회 및 웹 크롤링을 통한 데이터 저장 로직을 검증합니다.
 */
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

  describe('getWinningStores', () => {
    it('should return winning stores for a round', async () => {
      const mockStores = [{ id: BigInt(1), round: 1150 }];
      (prisma.lottoWinningStore.findMany as jest.Mock).mockResolvedValue(
        mockStores,
      );
      const result = await service.getWinningStores(1150);
      expect(result).toEqual(mockStores);
    });
  });

  describe('getWinningHistoryByName', () => {
    it('should return history for a store', async () => {
      (prisma.lottoWinningStore.findMany as jest.Mock).mockResolvedValue([
        { storeName: 'S' },
      ]);
      const result = await service.getWinningHistoryByName('S');
      expect(result).toHaveLength(1);
    });
  });

  describe('crawlWinningStores', () => {
    it('should skip if already exists', async () => {
      (prisma.lottoWinningStore.findFirst as jest.Mock).mockResolvedValue({
        id: BigInt(1),
      });
      const result = await service.crawlWinningStores(1150);
      expect(result.count).toBe(0);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should crawl and parse HTML correctly', async () => {
      (prisma.lottoWinningStore.findFirst as jest.Mock).mockResolvedValue(null);
      const html = `
        <table class="tbl_data">
          <tbody>
            <tr><td>1</td><td>Store1</td><td>Method1</td><td>Addr1</td></tr>
          </tbody>
        </table>
        <table class="tbl_data">
          <tbody>
            <tr><td>1</td><td>Store2</td><td>Addr2</td></tr>
          </tbody>
        </table>
      `;
      mockedAxios.get.mockResolvedValue({ data: iconv.encode(html, 'EUC-KR') });

      const result = await service.crawlWinningStores(1150);
      expect(result.count).toBe(2);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should handle no stores found', async () => {
      (prisma.lottoWinningStore.findFirst as jest.Mock).mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({
        data: iconv.encode('<table></table>', 'EUC-KR'),
      });

      const result = await service.crawlWinningStores(1150);
      expect(result.count).toBe(0);
      expect(result.message).toContain('No stores found');
    });

    it('should throw error if axios fails', async () => {
      (prisma.lottoWinningStore.findFirst as jest.Mock).mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(service.crawlWinningStores(1150)).rejects.toThrow(
        'Network Error',
      );
    });
  });
});
