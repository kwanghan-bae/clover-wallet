import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

interface WinningStoreInput {
  round: number;
  rank: 1 | 2;
  storeName: string;
  method: string | null;
  address: string;
}

@Injectable()
export class LottoWinningStoreService {
  private readonly logger = new Logger(LottoWinningStoreService.name);
  private readonly winningStoreUrl =
    'https://www.dhlottery.co.kr/store.do?method=topStore&drwNo=';

  constructor(private readonly prisma: PrismaService) {}

  async crawlWinningStores(
    round: number,
  ): Promise<{ count: number; message: string }> {
    if (await this.isAlreadyCrawled(round)) {
      this.logger.log(
        `${round} 회차 당첨 판매점 데이터가 이미 존재합니다. 건너뜁니다.`,
      );
      return { count: 0, message: 'Already exists' };
    }

    this.logger.log(`${round} 회차 판매점 크롤링 시작`);

    try {
      const $ = await this.fetchHtml(round);
      const storesToSave = this.parseAllStores($, round);

      if (storesToSave.length > 0) {
        await this.saveStoresToDb(storesToSave);
        this.logger.log(
          `${round} 회차 당첨 판매점 ${storesToSave.length}개 저장 성공`,
        );
        return { count: storesToSave.length, message: 'Saved' };
      }

      this.logger.warn(`${round} 회차 당첨 판매점을 찾을 수 없습니다`);
      return { count: 0, message: 'No stores found' };
    } catch (error) {
      this.logger.error(
        `${round} 회차 당첨 판매점 크롤링 실패`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  private async isAlreadyCrawled(round: number): Promise<boolean> {
    const existing = await this.prisma.lottoWinningStore.findFirst({
      where: { round },
    });
    return !!existing;
  }

  private async fetchHtml(round: number): Promise<cheerio.CheerioAPI> {
    const url = `${this.winningStoreUrl}${round}`;
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });
    const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
    return cheerio.load(decodedData);
  }

  private parseAllStores(
    $: cheerio.CheerioAPI,
    round: number,
  ): WinningStoreInput[] {
    const tables = $('table.tbl_data');
    const stores: WinningStoreInput[] = [];

    if (tables.length >= 1) {
      stores.push(...this.parseStoresByRank($, tables.eq(0), round, 1));
    }
    if (tables.length >= 2) {
      stores.push(...this.parseStoresByRank($, tables.eq(1), round, 2));
    }

    return stores;
  }

  private parseStoresByRank(
    $: cheerio.CheerioAPI,
    table: ReturnType<typeof $>,
    round: number,
    rank: 1 | 2,
  ): WinningStoreInput[] {
    const minCols = rank === 1 ? 4 : 3;
    const stores: WinningStoreInput[] = [];
    table.find('tbody tr').each((_, element) => {
      const tds = $(element).find('td');
      if (
        tds.length >= minCols &&
        !$(tds[0]).text().includes('조회 결과가 없습니다')
      ) {
        stores.push({
          round,
          rank,
          storeName: $(tds[1]).text().trim(),
          method: rank === 1 ? $(tds[2]).text().trim() : null,
          address: $(tds[rank === 1 ? 3 : 2])
            .text()
            .trim(),
        });
      }
    });
    return stores;
  }

  private async saveStoresToDb(
    storesToSave: WinningStoreInput[],
  ): Promise<void> {
    await this.prisma.$transaction(
      storesToSave.map((store) =>
        this.prisma.lottoWinningStore.create({
          data: { ...store, createdAt: new Date() },
        }),
      ),
    );
  }

  async getWinningStores(round: number) {
    return this.prisma.lottoWinningStore.findMany({
      where: { round },
      orderBy: { rank: 'asc' },
    });
  }

  async getWinningHistoryByName(storeName: string) {
    return this.prisma.lottoWinningStore.findMany({
      where: { storeName },
      orderBy: { round: 'desc' },
    });
  }
}
