// Word type represents a word and its meaning
export interface Word {
  id: number;
  original: string;
  translation: string;
}

// Language type represents a language with its words
export interface Language {
  id: string;
  name: string;
  words: Word[];
  levels: Level[];
  progress: number; // 0-100%
}

// Level type represents a level in the game
export interface Level {
  id: number;
  name: string;
  words: Word[];
  completed: boolean;
  score: number;
}

// UserProgress type represents the user's progress
export interface UserProgress {
  languages: Record<string, {
    currentLevel: number;
    totalScore: number;
    completedLevels: number[];
  }>;
  totalScore: number;
}

// GameSettings type represents the game settings
export interface GameSettings {
  wordsPerLevel: number; // Default: 5
  timePerWord: number; // Default: 30 seconds
  useImages: boolean; // Default: true
  soundEnabled: boolean; // Default: true
  imageProvider?: 'openai' | 'gemini'; // Default: 'openai'
  apiKey?: string; // API key for the selected provider
}

// FlashcardState type represents the current state of a flashcard
export type FlashcardState = 'front' | 'back' | 'correct' | 'incorrect'; 