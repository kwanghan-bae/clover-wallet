import { apiClient } from './client';
import type { PageResponse, LottoTicket, LottoGame } from '@clover/shared';

export type { LottoTicket, LottoGame };

export const ticketsApi = {
  getMyTickets: (page = 0, size = 20) =>
    apiClient.get(`tickets?page=${page}&size=${size}`).json<PageResponse<LottoTicket>>(),

  getTicketById: (id: number) =>
    apiClient.get(`tickets/${id}`).json<LottoTicket>(),

  scanTicket: (url: string) =>
    apiClient.post('tickets/scan', { json: { url } }).json<LottoTicket>(),
};
