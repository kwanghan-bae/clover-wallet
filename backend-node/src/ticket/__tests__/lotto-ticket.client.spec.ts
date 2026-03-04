import { LottoTicketClient } from '../client/lotto-ticket.client';
import axios from 'axios';
import * as iconv from 'iconv-lite';

jest.mock('axios');
/**
 * axios 모킹을 위한 객체입니다.
 */
const mockedAxios = axios as jest.Mocked<typeof axios>;

/**
 * LottoTicketClient에 대한 단위 테스트입니다.
 * 외부 URL로부터 HTML 및 JSON 데이터를 가져오는 기능을 검증하며,
 * 특히 EUC-KR 인코딩 처리가 올바른지 확인합니다.
 */
describe('LottoTicketClient', () => {
  let client: LottoTicketClient;

  beforeEach(() => {
    client = new LottoTicketClient();
    jest.clearAllMocks();
  });

  describe('getHtmlByUrl', () => {
    it('EUC-KR 인코딩된 HTML을 올바르게 가져와서 디코딩해야 한다', async () => {
      const url = 'http://example.com/lotto';
      const kKoreanText = '동행복권';
      const eucKrBuffer = iconv.encode(kKoreanText, 'euc-kr');

      mockedAxios.get.mockResolvedValue({
        data: eucKrBuffer,
        status: 200,
      });

      const result = await client.getHtmlByUrl(url);

      expect(result).toContain(kKoreanText);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          responseType: 'arraybuffer',
          timeout: 5000,
        }),
      );
    });

    it('네트워크 오류 발생 시 에러를 던져야 한다', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(client.getHtmlByUrl('http://fail.com')).rejects.toThrow(
        'Network Error',
      );
    });
  });

  describe('getJsonByUrl', () => {
    it('JSON 데이터를 성공적으로 가져와야 한다', async () => {
      const url = 'http://api.example.com/data';
      const mockData = { key: 'value' };

      mockedAxios.get.mockResolvedValue({
        data: mockData,
        status: 200,
      });

      const result = await client.getJsonByUrl(url);

      expect(result).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          timeout: 5000,
        }),
      );
    });

    it('JSON API 호출 실패 시 에러를 던져야 한다', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(client.getJsonByUrl('http://api-fail.com')).rejects.toThrow(
        'API Error',
      );
    });
  });
});
