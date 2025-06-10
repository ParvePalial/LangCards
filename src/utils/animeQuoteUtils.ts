import axios from 'axios';
import { AnimeQuote, AnimeQuoteResponse } from '../types';

// Example anime quotes as fallbacks
const fallbackAnimeQuotes: AnimeQuote[] = [
  {
    anime: {
      id: 388,
      name: 'The Future Diary',
      altName: 'Mirai Nikki'
    },
    character: {
      id: 1285,
      name: 'Amano Yukiteru'
    },
    content: "I'm pathetic. I was observing the world from a safe distance. I was just scared of being hurt. I was lonely."
  },
  {
    anime: {
      id: 21, 
      name: 'One Piece',
      altName: 'ワンピース'
    },
    character: {
      id: 63,
      name: 'Monkey D. Luffy'
    },
    content: "If you don't take risks, you can't create a future!"
  },
  {
    anime: {
      id: 43,
      name: 'Fullmetal Alchemist: Brotherhood',
      altName: '鋼の錬金術師 FULLMETAL ALCHEMIST'
    },
    character: {
      id: 147,
      name: 'Edward Elric'
    },
    content: "A lesson without pain is meaningless. That's because no one can gain without sacrificing something."
  },
  {
    anime: {
      id: 1,
      name: 'Naruto',
    },
    character: {
      id: 7,
      name: 'Uzumaki Naruto'
    },
    content: "Hard work is worthless for those that don't believe in themselves."
  },
  {
    anime: {
      id: 17,
      name: 'Death Note',
      altName: 'デスノート'
    },
    character: {
      id: 36,
      name: 'L Lawliet'
    },
    content: "Being alone is better than being with the wrong person."
  }
];

/**
 * Fetches a random anime quote
 * @returns Promise with an anime quote
 */
export const getRandomAnimeQuote = async (): Promise<AnimeQuote> => {
  try {
    // Primary attempt: animechan.xyz API
    try {
      console.log("Attempting to fetch from animechan.xyz...");
      const response = await fetch('https://animechan.xyz/api/random');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      console.log("Animechan.xyz API response:", data);
      
      if (data && data.anime && data.character && data.quote) {
        const quote = {
          anime: {
            id: 0,
            name: data.anime
          },
          character: {
            id: 0,
            name: data.character
          },
          content: data.quote
        };
        
        return quote;
      }
      throw new Error("Invalid data format from animechan.xyz");
    } catch (primaryError) {
      console.error("Primary API failed:", primaryError);
      
      // Backup attempt: original animechan.vercel.app API
      try {
        console.log("Trying backup API animechan.vercel.app...");
        const backupResponse = await fetch('https://animechan.vercel.app/api/random');
        if (!backupResponse.ok) throw new Error(`HTTP error! Status: ${backupResponse.status}`);
        
        const backupData = await backupResponse.json();
        console.log("Backup API response:", backupData);
        
        if (backupData && backupData.anime && backupData.character && backupData.quote) {
          const quote = {
            anime: {
              id: 0,
              name: backupData.anime
            },
            character: {
              id: 0,
              name: backupData.character
            },
            content: backupData.quote
          };
          
          return quote;
        }
        throw new Error("Invalid data format from backup API");
      } catch (backupError) {
        console.error("Backup API failed:", backupError);
        throw new Error("All API attempts failed");
      }
    }
  } catch (error) {
    console.error("Failed to fetch quote from any source:", error);
    return getRandomFallbackQuote();
  }
};

/**
 * Gets a random quote from the fallback list
 * @returns An anime quote
 */
export const getRandomFallbackQuote = (): AnimeQuote => {
  const randomIndex = Math.floor(Math.random() * fallbackAnimeQuotes.length);
  return fallbackAnimeQuotes[randomIndex];
};

/**
 * Formats an anime quote into a display string
 * @param quote The anime quote to format
 * @returns Formatted string with the quote and attribution
 */
export const formatAnimeQuote = (quote: AnimeQuote): string => {
  return `"${quote.content}" - ${quote.character.name} (${quote.anime.name})`;
}; 