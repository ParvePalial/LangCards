import React, { useState, useEffect } from 'react';
import { getRandomAnimeQuote, formatAnimeQuote, getRandomFallbackQuote } from '../utils/animeQuoteUtils';
import { AnimeQuote } from '../types';

const AnimeQuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState<AnimeQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchNewQuote = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("AnimeQuoteDisplay: Fetching new quote...");
      const newQuote = await getRandomAnimeQuote();
      console.log("AnimeQuoteDisplay: Received quote:", newQuote);
      setQuote(newQuote);
    } catch (err) {
      console.error('Error fetching anime quote:', err);
      setError('Failed to fetch an anime quote. Using a fallback quote instead.');
      // Use a fallback quote when API fails
      const fallbackQuote = getRandomFallbackQuote();
      setQuote(fallbackQuote);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewQuote();
  }, [retryCount]);

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Anime Quote</h2>
        
        <button 
          onClick={() => setRetryCount(prev => prev + 1)}
          disabled={isLoading}
          className="text-xs py-1 px-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-pulse text-gray-500">Loading anime quote...</div>
        </div>
      ) : error ? (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
          {error}
        </div>
      ) : null}
      
      {quote && !isLoading && (
        <div className="py-3">
          <blockquote className="italic text-lg mb-2">"{quote.content}"</blockquote>
          <div className="flex flex-col text-gray-600">
            <cite className="font-medium">— {quote.character.name}</cite>
            <span className="text-sm">
              {quote.anime.name}
              {quote.anime.altName && <span className="text-gray-400"> ({quote.anime.altName})</span>}
            </span>
          </div>
        </div>
      )}
      
      <button 
        onClick={fetchNewQuote}
        disabled={isLoading}
        className="mt-4 py-2 px-4 w-full bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
      >
        {isLoading ? 'Loading...' : 'New Anime Quote'}
      </button>
    </div>
  );
};

export default AnimeQuoteDisplay; 