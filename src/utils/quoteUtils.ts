import axios from 'axios';
import { QuoteResponse } from '../types';

// ZenQuotes API endpoint for random quotes - matches the example script
const API_URL = 'https://api.animechan.io/v1/quotes/random';

// Default quotes if API fails
const fallbackQuotes = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { content: "In the end, we will remember not the words of our enemies, but the silence of our friends.", author: "Martin Luther King Jr." },
  { content: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" }
];

export const getRandomQuote = async (): Promise<QuoteResponse> => {
  try {
    // This approach matches the example script in the user query
    const response = await fetch(API_URL);
    const dat = await response.json();
    console.log('ZenQuotes API response:', dat);

    const data = dat.content;
    
    // Select a random quote from the returned array
    if (Array.isArray(data) && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const quoteData = data[randomIndex];
      
      // Format may be {q, a} (q for quote, a for author)
      if (quoteData.q && quoteData.a) {
        return {
          content: quoteData.q,
          author: quoteData.a
        };
      }
      
      // Alternative format {quote, author}
      if (quoteData.quote && quoteData.author) {
        return {
          content: quoteData.quote,
          author: quoteData.author
        };
      }
    }
    
    // If data format is unexpected or empty, use fallback
    throw new Error('Invalid or empty response from ZenQuotes API');
    
  } catch (error) {
    console.error('Error fetching quote:', error);
    
    // Try alternative approach with axios if fetch fails (might help with CORS issues)
    try {
      console.log('Attempting to fetch quote with axios...');
      const axiosResponse = await axios.get(API_URL);
      const axiosData = axiosResponse.data;
      
      if (Array.isArray(axiosData) && axiosData.length > 0) {
        const randomIndex = Math.floor(Math.random() * axiosData.length);
        const quoteData = axiosData[randomIndex];
        
        if (quoteData.q || quoteData.quote) {
          return {
            content: quoteData.q || quoteData.quote,
            author: quoteData.a || quoteData.author || 'Unknown'
          };
        }
      }
    } catch (axiosError) {
      console.error('Axios quote fetch failed:', axiosError);
    }
    
    // If all API attempts fail, use a fallback quote
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
  }
}; 