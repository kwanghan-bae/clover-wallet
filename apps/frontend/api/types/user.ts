import type { UserSummary as SharedUserSummary, UserDetail } from '@clover/shared';

export interface UserSummary extends SharedUserSummary {
  profileImageUrl?: string;
}

export type { UserDetail };
