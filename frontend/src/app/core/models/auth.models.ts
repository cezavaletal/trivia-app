export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  createdAt?: string;
  stats?: UserStats;
}

export interface UserStats {
  gamesPlayed: number;
  highestScore: number;
  totalCorrectAnswers: number;
  bestStreak: number;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresInSeconds: number;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}
