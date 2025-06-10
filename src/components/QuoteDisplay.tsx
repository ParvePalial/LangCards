import React, { useState, useEffect } from 'react';
import { getRandomQuote } from '../utils/quoteUtils';
import { QuoteResponse } from '../types';

const QuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewQuote = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newQuote = await getRandomQuote();
      setQuote(newQuote);
    } catch (err) {
      console.error('Error fetching quote:', err);
      setError('Failed to fetch a quote. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewQuote();
    
    // Optional: Set up a timer to refresh the quote periodically
    const intervalId = setInterval(() => {
      fetchNewQuote();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6 text-center">
      <h2 className="text-xl font-semibold mb-3">Quote of the Moment</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-pulse text-gray-500">Loading quote...</div>
        </div>
      ) : error ? (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      ) : quote ? (
        <div className="py-3">
          <blockquote className="italic text-lg mb-2">"{quote.content}"</blockquote>
          <cite className="text-gray-600">— {quote.author}</cite>
        </div>
      ) : null}
      
      <button 
        onClick={fetchNewQuote}
        disabled={isLoading}
        className="mt-4 py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md disabled:bg-gray-100 disabled:text-gray-400"
      >
        {isLoading ? 'Loading...' : 'New Quote'}
      </button>
    </div>
  );
};

export default QuoteDisplay; 