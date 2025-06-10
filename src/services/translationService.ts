import axios from 'axios';
import { Translation } from '../types';

// Lecto AI API endpoint and key
const LECTO_API_URL = 'https://api.lecto.ai/v1/translate/text';
const LECTO_API_KEY = process.env.REACT_APP_LECTO_API_KEY || 'SZS7SD3-V24MPP3-H3XD6HB-71J8XKC';

// MyMemory API as fallback (free, no key required for moderate usage)
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

export const translateText = async (
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'auto'
): Promise<Translation> => {
  try {
    // First try with Lecto API
    const response = await axios.post(
      LECTO_API_URL,
      {
        texts: [text],
        to: targetLanguage,
        from: sourceLanguage === 'auto' ? null : sourceLanguage
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': LECTO_API_KEY
        },
        timeout: 5000 // 5 second timeout
      }
    );

    console.log('Lecto API response:', response.data);

    // Lecto returns an array of translations in the 'translations' field
    if (response.data.translations && response.data.translations.length > 0) {
      const translatedText = response.data.translations[0];
      const detectedSource = response.data.from || sourceLanguage;

      return {
        originalText: text,
        translatedText,
        sourceLanguage: detectedSource,
        targetLanguage
      };
    }
    
    // If we didn't get a valid response from Lecto, throw an error to try fallback
    throw new Error('Invalid Lecto API response');
    
  } catch (error) {
    console.error('Lecto translation error:', error);
    
    // Try fallback with MyMemory API
    try {
      console.log('Trying fallback translation with MyMemory API');
      
      // Format language codes for MyMemory (it uses format like 'en|fr')
      const langPair = `${sourceLanguage === 'auto' ? 'auto' : sourceLanguage}|${targetLanguage}`;
      
      const fallbackResponse = await axios.get(MYMEMORY_API_URL, {
        params: {
          q: text,
          langpair: langPair,
          de: 'your-email@example.com' // optional for better rate limits
        },
        timeout: 5000
      });
      
      console.log('MyMemory API response:', fallbackResponse.data);
      
      if (fallbackResponse.data && fallbackResponse.data.responseData && fallbackResponse.data.responseData.translatedText) {
        return {
          originalText: text,
          translatedText: fallbackResponse.data.responseData.translatedText,
          sourceLanguage: sourceLanguage === 'auto' ? fallbackResponse.data.responseData.detectedLanguage || 'en' : sourceLanguage,
          targetLanguage
        };
      }
      
      throw new Error('Invalid MyMemory API response');
    } catch (fallbackError) {
      console.error('Fallback translation error:', fallbackError);
      
      // If all translation attempts fail, return the original text
      return {
        originalText: text,
        translatedText: text,
        sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
        targetLanguage
      };
    }
  }
}; 