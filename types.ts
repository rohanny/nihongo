export interface Kana {
  char: string;
  romaji: string;
  type: 'hiragana' | 'katakana' | 'kanji';
  group: string; // e.g., 'a', 'ka', 'sa', 'numbers'
}

export interface UserProgress {
  learned: string[]; // List of romaji identifiers representing characters marked as 'known'
  revisionList: string[]; // List of romaji identifiers that need review
  dailyProgress: {
    date: string; // ISO date string
    count: number;
  };
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