export interface Translation {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface FlashcardItem {
  id: string;
  word: string;
  translation: string;
  meaning: string;         // Definition or meaning of the word
  partOfSpeech: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: Date;
  context?: string;       // Optional context where the word appears
  translatedWord?: string; // The translated form of just this word (not the full text)
}

export interface LanguageOption {
  code: string;
  name: string;
}

export interface NerEntity {
  word: string;
  type: string;
  position: [number, number];
}

export interface NerResponse {
  entities: NerEntity[];
}

export interface QuoteResponse {
  content: string;
  author: string;
}

export interface AnimeQuote {
  anime: {
    id: number;
    name: string;
    altName?: string;
  };
  character: {
    id: number;
    name: string;
  };
  content: string;
}

export interface AnimeQuoteResponse {
  quote: AnimeQuote;
} 