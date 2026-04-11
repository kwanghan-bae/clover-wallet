jest.mock('../../api/client', () => ({
  apiClient: {
    get: jest.fn().mockReturnValue({
      json: jest.fn().mockResolvedValue({
        content: [{ id: 1, ordinal: 1100, status: 'STASHED' }],
        totalElements: 1,
      }),
    }),
    post: jest.fn().mockReturnValue({
      json: jest.fn().mockResolvedValue({ id: 1, ordinal: 1100, status: 'STASHED' }),
    }),
  },
}));

import { ticketsApi } from '../../api/tickets';

describe('ticketsApi', () => {
  it('should fetch user tickets', async () => {
    const result = await ticketsApi.getMyTickets(0, 20);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].status).toBe('STASHED');
  });

  it('should scan a ticket by URL', async () => {
    const result = await ticketsApi.scanTicket('https://m.dhlottery.co.kr/qr.do?method=...');
    expect(result.id).toBe(1);
  });
});
