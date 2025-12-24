export interface UserSummary {
  id: number;
  nickname: string;
  badges?: string[];
  profileImageUrl?: string;
}

export interface UserDetail extends UserSummary {
  email: string;
  age: number;
  locale: string;
  createdAt: string;
}
