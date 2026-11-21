export interface AnswerOptionPublic {
  id: number;
  text: string;
}

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type GameMode = 'QUICK_PLAY' | 'CATEGORY';
export type GameStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface QuestionPublic {
  id: number;
  order: number;
  categoryName: string;
  difficulty: DifficultyLevel;
  timeLimitSeconds: number;
  text: string;
  options: AnswerOptionPublic[];
}

export interface StartGameRequest {
  gameMode: GameMode;
  categoryId?: number | null;
}

export interface GameStartedResponse {
  gameId: number;
  gameMode: GameMode;
  status: GameStatus;
  totalQuestions: number;
  totalScore: number;
  currentStreak: number;
  createdAt: string;
  questions: QuestionPublic[];
}

export interface GameStateResponse {
  gameId: number;
  status: GameStatus;
  totalScore: number;
  currentStreak: number;
  answeredCount: number;
  totalQuestions: number;
  currentQuestionIndex: number;
}

export interface SubmitAnswerRequest {
  questionId: number;
  selectedOptionId: number | null;
  clientDurationMs: number;
}

export interface ScoreCalculation {
  baseScore: number;
  speedBonus: number;
  currentStreak: number;
  streakMultiplier: number;
  pointsAwarded: number;
}

export interface GameProgress {
  totalScore: number;
  currentStreak: number;
  remainingQuestions: number;
}

export interface SubmitAnswerResponse {
  questionId: number;
  isCorrect: boolean;
  correctOptionId: number;
  explanation: string;
  scoreCalculation: ScoreCalculation;
  gameProgress: GameProgress;
}

export interface LeaderboardUpdate {
  globalRank: number;
  weeklyRank: number;
  isPersonalBest: boolean;
}

export interface GameSummary {
  gameId: number;
  status: GameStatus;
  finalScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
  maxStreak: number;
  totalDurationSeconds: number;
  accuracyPercentage: number;
  leaderboardUpdate?: LeaderboardUpdate;
  completedAt: string;
}
