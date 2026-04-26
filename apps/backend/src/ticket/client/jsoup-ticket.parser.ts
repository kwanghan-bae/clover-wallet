import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as cheerio from 'cheerio';

/**
 * 파싱된 티켓 정보 인터페이스
 */
export interface ParsedTicket {
  ordinal: number;
  status: string;
  games: ParsedGame[];
}

/**
 * 파싱된 개별 게임 정보 인터페이스
 */
export interface ParsedGame {
  status: string;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
}

/**
 * 동행복권 HTML 문서를 파싱하여 로또 데이터를 추출하는 클래스입니다.
 */
@Injectable()
export class JsoupTicketParser {
  private readonly logger = new Logger(JsoupTicketParser.name);

  // 셀렉터 정의
  private readonly selectors = {
    ordinalSelector: 'h3 > span.key_clr1',
    ticketStatusSelector: 'div.bx_notice.winner strong',
    gameRowsSelector: 'div.list_my_number table tbody tr',
    gameResultSelector: 'td.result',
    gameNumbersSelector: 'td span.clr',
  };

  parse(html: string): ParsedTicket {
    const $ = cheerio.load(html);

    const ordinal = this.getOrdinal($);
    const status = this.getTicketStatus($);
    const games = this.getGames($);

    return { ordinal, status, games };
  }

  private getOrdinal($: cheerio.CheerioAPI): number {
    const text = $(this.selectors.ordinalSelector).first().text() || '0';
    return parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
  }

  private getTicketStatus($: cheerio.CheerioAPI): string {
    const text = $(this.selectors.ticketStatusSelector).first().text() || '';

    if (text.includes('당첨')) return 'WINNING';
    if (text.includes('낙첨')) return 'LOSING';
    if (text.includes('추첨')) return 'STASHED';

    this.logger.error(`식별할 수 없는 티켓 상태: ${text}`);
    throw new BadRequestException(`식별할 수 없는 티켓 상태입니다: ${text}`);
  }

  private getGames($: cheerio.CheerioAPI): ParsedGame[] {
    const games: ParsedGame[] = [];
    const rows = $(this.selectors.gameRowsSelector);

    rows.each((_, element) => {
      const game = this.parseGameRow($, element);
      if (game) games.push(game);
    });

    return games;
  }

  private parseGameRow($: cheerio.CheerioAPI, element: any): ParsedGame | null {
    const row = $(element);
    const resultText = row
      .find(this.selectors.gameResultSelector)
      .text()
      .trim();
    const numbers = row
      .find(this.selectors.gameNumbersSelector)
      .map((_, el) => parseInt($(el).text(), 10))
      .get();

    if (numbers.length !== 6) return null;

    return {
      status: this.parseGameStatus(resultText),
      number1: numbers[0],
      number2: numbers[1],
      number3: numbers[2],
      number4: numbers[3],
      number5: numbers[4],
      number6: numbers[5],
    };
  }

  private parseGameStatus(text: string): string {
    const statusMap: { [key: string]: string } = {
      '1등당첨': 'WINNING_1',
      '2등당첨': 'WINNING_2',
      '3등당첨': 'WINNING_3',
      '4등당첨': 'WINNING_4',
      '5등당첨': 'WINNING_5',
    };

    for (const [key, value] of Object.entries(statusMap)) {
      if (text.includes(key)) return value;
    }

    return 'LOSING';
  }
}
