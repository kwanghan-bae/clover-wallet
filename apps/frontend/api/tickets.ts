import { apiClient } from './client';

export interface LottoTicket {
  id: number;
  ordinal: number;
  status: 'STASHED' | 'WINNING' | 'LOSING';
  url?: string;
  games?: LottoGame[];
  createdAt: string;
}

export interface LottoGame {
  id: number;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  status: string;
  prizeAmount: number;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const ticketsApi = {
  getMyTickets: (page = 0, size = 20) =>
    apiClient.get(`tickets?page=${page}&size=${size}`).json<PageResponse<LottoTicket>>(),

  getTicketById: (id: number) =>
    apiClient.get(`tickets/${id}`).json<LottoTicket>(),

  scanTicket: (url: string) =>
    apiClient.post('tickets/scan', { json: { url } }).json<LottoTicket>(),
};
