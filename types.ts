export interface Kana {
  char: string;
  romaji: string;
  type: 'hiragana' | 'katakana' | 'kanji';
  group: string; // e.g., 'a', 'ka', 'sa', 'numbers'
}

export interface Session {
  id: string;
  name: string;
  lastActive: number;
  avatar?: string;
}

export interface QuizSession {
  startTime: number;
  endTime: number;
  correct: number;
  total: number;
}

export interface DailyStats {
  date: string;       // ISO YYYY-MM-DD
  studyCount: number; // Cards learned/seen
  quizCorrect: number;
  quizTotal: number;
  sessions?: QuizSession[];
}

export interface UserProgress {
  learned: string[]; // List of romaji identifiers representing characters marked as 'known'
  revisionList: string[]; // List of romaji identifiers that need review
  dailyProgress: {
    date: string; // ISO date string
    count: number;
  };
  history: DailyStats[];
  settings: {
    dailyGoal: number;
  };
}

export interface QuizQuestion {
  question: string;
  targetChar: string; // The character displayed
  options: string[]; // 4 romaji options
  correctAnswer: string; // The correct romaji
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  STUDY = 'STUDY',
  REVISE = 'REVISE',
  QUIZ = 'QUIZ',
  SETTINGS = 'SETTINGS',
}