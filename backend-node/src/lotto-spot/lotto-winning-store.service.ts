import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

/**
 * 동행복권 사이트에서 당첨 판매점 정보를 크롤링하고 관리하는 서비스입니다.
 */
@Injectable()
export class LottoWinningStoreService {
  private readonly logger = new Logger(LottoWinningStoreService.name);
  private readonly winningStoreUrl =
    'https://www.dhlottery.co.kr/store.do?method=topStore&drwNo=';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 특정 회차의 당첨 판매점 정보를 사이트에서 크롤링하여 DB에 저장합니다.
   */
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
      this.logger.error(`${round} 회차 당첨 판매점 크롤링 실패`, error.stack);
      throw error;
    }
  }

  /**
   * 이미 해당 회차의 데이터가 크롤링되었는지 확인합니다.
   */
  private async isAlreadyCrawled(round: number): Promise<boolean> {
    const existing = await this.prisma.lottoWinningStore.findFirst({
      where: { round },
    });
    return !!existing;
  }

  /**
   * 지정된 회차의 HTML 페이지를 가져와 Cheerio 객체로 반환합니다.
   */
  private async fetchHtml(round: number): Promise<cheerio.CheerioAPI> {
    const url = `${this.winningStoreUrl}${round}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
    return cheerio.load(decodedData);
  }

  /**
   * HTML 데이터에서 모든 등수의 판매점 정보를 추출합니다.
   */
  private parseAllStores($: cheerio.CheerioAPI, round: number): any[] {
    const tables = $('table.tbl_data');
    const stores: any[] = [];

    if (tables.length >= 1)
      stores.push(...this.parseRank1Stores($, tables[0], round));
    if (tables.length >= 2)
      stores.push(...this.parseRank2Stores($, tables[1], round));

    return stores;
  }

  /**
   * 1등 당첨 판매점 테이블을 파싱합니다.
   */
  private parseRank1Stores(
    $: cheerio.CheerioAPI,
    table: any,
    round: number,
  ): any[] {
    const stores: any[] = [];
    $(table)
      .find('tbody tr')
      .each((_, element) => {
        const tds = $(element).find('td');
        if (
          tds.length >= 4 &&
          !$(tds[0]).text().includes('조회 결과가 없습니다')
        ) {
          stores.push({
            round,
            rank: 1,
            storeName: $(tds[1]).text().trim(),
            method: $(tds[2]).text().trim(),
            address: $(tds[3]).text().trim(),
          });
        }
      });
    return stores;
  }

  /**
   * 2등 당첨 판매점 테이블을 파싱합니다.
   */
  private parseRank2Stores(
    $: cheerio.CheerioAPI,
    table: any,
    round: number,
  ): any[] {
    const stores: any[] = [];
    $(table)
      .find('tbody tr')
      .each((_, element) => {
        const tds = $(element).find('td');
        if (
          tds.length >= 3 &&
          !$(tds[0]).text().includes('조회 결과가 없습니다')
        ) {
          stores.push({
            round,
            rank: 2,
            storeName: $(tds[1]).text().trim(),
            address: $(tds[2]).text().trim(),
            method: null,
          });
        }
      });
    return stores;
  }

  /**
   * 판매점 정보를 데이터베이스에 저장합니다.
   */
  private async saveStoresToDb(storesToSave: any[]): Promise<void> {
    await this.prisma.$transaction(
      storesToSave.map((store) =>
        this.prisma.lottoWinningStore.create({
          data: { ...store, createdAt: new Date() },
        }),
      ),
    );
  }

  /**
   * 특정 회차의 당첨 판매점 목록을 DB에서 조회합니다.
   */
  async getWinningStores(round: number) {
    return this.prisma.lottoWinningStore.findMany({
      where: { round },
      orderBy: { rank: 'asc' },
    });
  }

  /**
   * 판매점 이름을 기준으로 과거 당첨 이력을 조회합니다.
   */
  async getWinningHistoryByName(storeName: string) {
    return this.prisma.lottoWinningStore.findMany({
      where: { storeName },
      orderBy: { round: 'desc' },
    });
  }
}
