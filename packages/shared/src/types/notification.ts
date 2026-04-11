export interface Notification {
  id: bigint;
  userId: bigint;
  title: string;
  message: string;
  isRead: boolean;
  type: 'INFO' | 'WINNING' | 'SYSTEM';
  createdAt?: string;
}
