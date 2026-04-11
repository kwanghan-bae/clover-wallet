export interface UserSummary {
  id: bigint;
  nickname: string;
  badges: string[];
}

export interface UserDetail extends UserSummary {
  email?: string;
  age: number;
  locale: string;
  createdAt?: string;
}

export interface UserStats {
  totalWinnings: number;
  roi: number;
  totalGames: number;
  winCount: number;
}

export interface FollowCounts {
  followers: number;
  following: number;
}
