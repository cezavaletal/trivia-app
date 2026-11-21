export interface LeaderboardPlayer {
  rank: number;
  userId: number;
  username: string;
  totalScore?: number;
  score?: number;
  gamesPlayed?: number;
  accuracyPercentage?: number;
  winRate?: number;
  bestStreak?: number;
  badge?: string;
}

export interface CurrentUserRank {
  rank: number;
  userId: number;
  username: string;
  totalScore?: number;
  score?: number;
  gamesPlayed?: number;
  winRate?: number;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber?: number;
  pageSize?: number;
  totalElements: number;
  totalPages?: number;
  last?: boolean;
}

export interface LeaderboardGlobalResponse {
  currentUserRank?: CurrentUserRank;
  topPlayers: PageResponse<LeaderboardPlayer>;
}

export interface LeaderboardWeeklyResponse {
  weekNumber: number;
  year: number;
  startsAt: string;
  endsAt: string;
  currentUserRank?: CurrentUserRank;
  topPlayers: PageResponse<LeaderboardPlayer>;
}

export interface LeaderboardCategoryResponse {
  categoryId: number;
  categoryName: string;
  currentUserRank?: CurrentUserRank;
  topPlayers: PageResponse<LeaderboardPlayer>;
}

export interface ApiValidationError {
  field: string;
  rejectedValue: any;
  message: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: ApiValidationError[];
}
