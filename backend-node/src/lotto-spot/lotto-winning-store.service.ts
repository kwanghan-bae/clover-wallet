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
  /** 로거 인스턴스 */
  private readonly logger = new Logger(LottoWinningStoreService.name);
  /** 당첨 판매점 정보 조회를 위한 외부 URL */
  private readonly winningStoreUrl =
    'https://www.dhlottery.co.kr/store.do?method=topStore&drwNo=';

  /**
   * Prisma 서비스를 주입받습니다.
   * @param prisma 데이터베이스 접근 서비스
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 특정 회차의 당첨 판매점 정보를 사이트에서 크롤링하여 DB에 저장합니다.
   * @param round 크롤링할 로또 회차
   * @returns 처리 결과 (개수 및 메시지)
   */
  async crawlWinningStores(
    round: number,
  ): Promise<{ count: number; message: string }> {
    const existing = await this.prisma.lottoWinningStore.findFirst({
      where: { round },
    });

    if (existing) {
      this.logger.log(
        `${round} 회차 당첨 판매점 데이터가 이미 존재합니다. 건너뜁니다.`,
      );
      return { count: 0, message: 'Already exists' };
    }

    this.logger.log(`${round} 회차 판매점 크롤링 시작`);

    try {
      const url = `${this.winningStoreUrl}${round}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
      const $ = cheerio.load(decodedData);

      const tables = $('table.tbl_data');
      if (tables.length === 0) {
        this.logger.warn(`${round} 회차 당첨 판매점 테이블을 찾을 수 없습니다`);
        return { count: 0, message: 'No tables found' };
      }

      const storesToSave: any[] = [];

      // 1등 당첨 판매점 파싱
      if (tables.length >= 1) {
        storesToSave.push(...this.parseRank1Stores($, tables[0], round));
      }

      // 2등 당첨 판매점 파싱
      if (tables.length >= 2) {
        storesToSave.push(...this.parseRank2Stores($, tables[1], round));
      }

      if (storesToSave.length > 0) {
        await this.saveStoresToDb(storesToSave);
        this.logger.log(
          `${round} 회차 당첨 판매점 ${storesToSave.length}개 저장 성공`,
        );
      } else {
        this.logger.warn(`${round} 회차 당첨 판매점을 찾을 수 없습니다`);
        return { count: 0, message: 'No stores found' };
      }

      return { count: storesToSave.length, message: 'Saved' };
    } catch (error) {
      this.logger.error(`${round} 회차 당첨 판매점 크롤링 실패`, error);
      throw error;
    }
  }

  /**
   * 1등 당첨 판매점 테이블을 파싱합니다.
   * @param $ cheerio 객체
   * @param table 파싱할 테이블 엘리먼트
   * @param round 로또 회차
   * @returns 판매점 정보 배열
   */
  private parseRank1Stores($: any, table: any, round: number): any[] {
    const stores: any[] = [];
    const rows = $(table).find('tbody tr');

    rows.each((_, element) => {
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
   * @param $ cheerio 객체
   * @param table 파싱할 테이블 엘리먼트
   * @param round 로또 회차
   * @returns 판매점 정보 배열
   */
  private parseRank2Stores($: any, table: any, round: number): any[] {
    const stores: any[] = [];
    const rows = $(table).find('tbody tr');

    rows.each((_, element) => {
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
   * @param storesToSave 저장할 판매점 배열
   */
  private async saveStoresToDb(storesToSave: any[]): Promise<void> {
    await this.prisma.$transaction(
      storesToSave.map((store) =>
        this.prisma.lottoWinningStore.create({
          data: {
            ...store,
            createdAt: new Date(),
          },
        }),
      ),
    );
  }

  /**
   * 특정 회차의 당첨 판매점 목록을 DB에서 조회합니다.
   * @param round 조회할 회차
   */
  async getWinningStores(round: number) {
    return this.prisma.lottoWinningStore.findMany({
      where: { round },
      orderBy: { rank: 'asc' },
    });
  }

  /**
   * 판매점 이름을 기준으로 과거 당첨 이력을 조회합니다.
   * @param storeName 조회할 판매점 이름
   */
  async getWinningHistoryByName(storeName: string) {
    return this.prisma.lottoWinningStore.findMany({
      where: { storeName },
      orderBy: { round: 'desc' },
    });
  }
}
