import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as cheerio from 'cheerio';

/**
 * 파싱된 티켓 정보 인터페이스
 */
export interface ParsedTicket {
  ordinal: Int;
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

type Int = number;

/**
 * 동행복권 HTML 문서를 파싱하여 로또 데이터를 추출하는 클래스입니다.
 * Kotlin JsoupTicketParser 로직을 이식함.
 */
@Injectable()
export class JsoupTicketParser {
  private readonly logger = new Logger(JsoupTicketParser.name);

  // 셀렉터 정의 (Kotlin LottoScrapingProperties 기반)
  private readonly selectors = {
    ordinalSelector: 'h3 > span.key_clr1',
    ticketStatusSelector: 'div.bx_notice.winner strong',
    gameRowsSelector: 'div.list_my_number table tbody tr',
    gameResultSelector: 'td.result',
    gameNumbersSelector: 'td span.clr',
  };

  /**
   * HTML 문자열을 파싱하여 티켓 정보를 추출합니다.
   * @param html HTML 소스
   */
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
      const row = $(element);
      const resultText = row.find(this.selectors.gameResultSelector).text().trim();
      const numbers = row
        .find(this.selectors.gameNumbersSelector)
        .map((_, el) => parseInt($(el).text(), 10))
        .get();

      if (numbers.length === 6) {
        games.push({
          status: this.parseGameStatus(resultText),
          number1: numbers[0],
          number2: numbers[1],
          number3: numbers[2],
          number4: numbers[3],
          number5: numbers[4],
          number6: numbers[5],
        });
      }
    });

    return games;
  }

  private parseGameStatus(text: string): string {
    if (text.includes('1등당첨')) return 'WINNING_1';
    if (text.includes('2등당첨')) return 'WINNING_2';
    if (text.includes('3등당첨')) return 'WINNING_3';
    if (text.includes('4등당첨')) return 'WINNING_4';
    if (text.includes('5등당첨')) return 'WINNING_5';
    return 'LOSING';
  }
}
