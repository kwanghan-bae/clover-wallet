import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as iconv from 'iconv-lite';

/**
 * 동행복권 사이트에서 티켓 HTML 및 JSON 데이터를 가져오는 클라이언트입니다.
 * Kotlin LottoTicketClient 로직을 이식함.
 */
@Injectable()
export class LottoTicketClient {
  private readonly logger = new Logger(LottoTicketClient.name);
  private readonly TIMEOUT_MS = 5000;

  /**
   * 주어진 URL에서 HTML 문서를 가져옵니다. (EUC-KR 인코딩 처리)
   * @param url 티켓 URL
   */
  async getHtmlByUrl(url: string): Promise<string> {
    this.logger.log(`URL에서 문서 가져오기: ${url}`);
    try {
      const response = await axios.get(url, {
        timeout: this.TIMEOUT_MS,
        responseType: 'arraybuffer', // 바이너리로 받아서 직접 디코딩
      });
      
      // 동행복권은 EUC-KR을 사용하므로 변환 필요
      const html = iconv.decode(Buffer.from(response.data), 'euc-kr');
      this.logger.log(`URL에서 문서 가져오기 성공: ${url}`);
      return html;
    } catch (error) {
      this.logger.error(`문서 가져오기 실패: ${url}`, error.stack);
      throw error;
    }
  }

  /**
   * 주어진 URL에서 JSON 데이터를 가져옵니다.
   * @param url API URL
   */
  async getJsonByUrl(url: string): Promise<any> {
    this.logger.log(`JSON API 호출: ${url}`);
    try {
      const response = await axios.get(url, {
        timeout: this.TIMEOUT_MS,
      });
      this.logger.log(`JSON API 호출 성공`);
      return response.data;
    } catch (error) {
      this.logger.error(`JSON API 호출 실패: ${url}`, error.stack);
      throw error;
    }
  }
}
