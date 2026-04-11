import { JsoupTicketParser } from '../client/jsoup-ticket.parser';
import { BadRequestException } from '@nestjs/common';

/**
 * JsoupTicketParser에 대한 단위 테스트입니다.
 * 동행복권 사이트의 HTML 구조를 분석하여 회차, 티켓 상태,
 * 각 게임별 당첨 결과를 정확하게 파싱하는지 검증합니다.
 */
describe('JsoupTicketParser', () => {
  let parser: JsoupTicketParser;

  beforeEach(() => {
    parser = new JsoupTicketParser();
  });

  describe('parse', () => {
    it('당첨된 티켓 HTML을 올바르게 파싱해야 한다', () => {
      const html = `
        <div class="winner">
          <h3><span class="key_clr1">1050</span>회차</h3>
          <div class="bx_notice winner"><strong>당첨</strong></div>
          <div class="list_my_number">
            <table>
              <tbody>
                <tr>
                  <td class="result">1등당첨</td>
                  <td><span class="clr">1</span></td>
                  <td><span class="clr">2</span></td>
                  <td><span class="clr">3</span></td>
                  <td><span class="clr">4</span></td>
                  <td><span class="clr">5</span></td>
                  <td><span class="clr">6</span></td>
                </tr>
                <tr>
                  <td class="result">낙첨</td>
                  <td><span class="clr">10</span></td>
                  <td><span class="clr">11</span></td>
                  <td><span class="clr">12</span></td>
                  <td><span class="clr">13</span></td>
                  <td><span class="clr">14</span></td>
                  <td><span class="clr">15</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;

      const result = parser.parse(html);

      expect(result.ordinal).toBe(1050);
      expect(result.status).toBe('WINNING');
      expect(result.games).toHaveLength(2);
      expect(result.games[0]).toEqual({
        status: 'WINNING_1',
        number1: 1,
        number2: 2,
        number3: 3,
        number4: 4,
        number5: 5,
        number6: 6,
      });
      expect(result.games[1].status).toBe('LOSING');
    });

    it('낙첨된 티켓 HTML을 올바르게 파싱해야 한다', () => {
      const html = `
        <div>
          <h3><span class="key_clr1">1051</span>회</h3>
          <div class="bx_notice winner"><strong>낙첨</strong></div>
          <div class="list_my_number">
            <table><tbody><tr><td class="result">낙첨</td><td><span class="clr">7</span></td><td><span class="clr">8</span></td><td><span class="clr">9</span></td><td><span class="clr">10</span></td><td><span class="clr">11</span></td><td><span class="clr">12</span></td></tr></tbody></table>
          </div>
        </div>
      `;

      const result = parser.parse(html);

      expect(result.ordinal).toBe(1051);
      expect(result.status).toBe('LOSING');
    });

    it('추첨 대기 중인 티켓 HTML을 올바르게 파싱해야 한다', () => {
      const html = `
        <div>
          <h3><span class="key_clr1">1052</span></h3>
          <div class="bx_notice winner"><strong>추첨전</strong></div>
          <div class="list_my_number">
            <table><tbody><tr><td class="result">미추첨</td><td><span class="clr">1</span></td><td><span class="clr">2</span></td><td><span class="clr">3</span></td><td><span class="clr">4</span></td><td><span class="clr">5</span></td><td><span class="clr">6</span></td></tr></tbody></table>
          </div>
        </div>
      `;

      const result = parser.parse(html);

      expect(result.ordinal).toBe(1052);
      expect(result.status).toBe('STASHED');
    });

    it('모든 등수의 당첨 상태를 올바르게 파싱해야 한다', () => {
      const statuses = [
        '1등당첨',
        '2등당첨',
        '3등당첨',
        '4등당첨',
        '5등당첨',
        '기타',
      ];
      const expected = [
        'WINNING_1',
        'WINNING_2',
        'WINNING_3',
        'WINNING_4',
        'WINNING_5',
        'LOSING',
      ];

      statuses.forEach((status, index) => {
        const html = `
          <div>
            <div class="bx_notice winner"><strong>당첨</strong></div>
            <div class="list_my_number">
              <table><tbody><tr><td class="result">${status}</td><td><span class="clr">1</span></td><td><span class="clr">2</span></td><td><span class="clr">3</span></td><td><span class="clr">4</span></td><td><span class="clr">5</span></td><td><span class="clr">6</span></td></tr></tbody></table>
            </div>
          </div>
        `;
        const result = parser.parse(html);
        expect(result.games[0].status).toBe(expected[index]);
      });
    });

    it('식별할 수 없는 티켓 상태인 경우 BadRequestException을 던져야 한다', () => {
      const html = `
        <div>
          <div class="bx_notice winner"><strong>알수없음</strong></div>
        </div>
      `;

      expect(() => parser.parse(html)).toThrow(BadRequestException);
    });

    it('회차 정보가 없는 경우 0을 반환해야 한다', () => {
      const html = `
        <div>
          <div class="bx_notice winner"><strong>당첨</strong></div>
        </div>
      `;

      const result = parser.parse(html);
      expect(result.ordinal).toBe(0);
    });
  });
});
