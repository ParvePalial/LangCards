import React, { useState, useEffect } from 'react';
import { AnimeQuote } from '../types';
import { getRandomFallbackQuote } from '../utils/animeQuoteUtils';

interface AnimeQuoteAdminProps {
  onSave?: (quote: AnimeQuote) => void;
}

const AnimeQuoteAdmin: React.FC<AnimeQuoteAdminProps> = ({ onSave }) => {
  const [quotes, setQuotes] = useState<AnimeQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<AnimeQuote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [animeId, setAnimeId] = useState<string>('');
  const [animeName, setAnimeName] = useState<string>('');
  const [animeAltName, setAnimeAltName] = useState<string>('');
  const [characterId, setCharacterId] = useState<string>('');
  const [characterName, setCharacterName] = useState<string>('');
  const [content, setContent] = useState<string>('');
  
  useEffect(() => {
    // In a real app, this would load from an API or database
    // For demo, we'll create a few sample quotes
    const sampleQuotes: AnimeQuote[] = Array(5).fill(null).map(() => getRandomFallbackQuote());
    setQuotes(sampleQuotes);
  }, []);
  
  const handleEditQuote = (quote: AnimeQuote) => {
    setSelectedQuote(quote);
    setAnimeId(quote.anime.id.toString());
    setAnimeName(quote.anime.name);
    setAnimeAltName(quote.anime.altName || '');
    setCharacterId(quote.character.id.toString());
    setCharacterName(quote.character.name);
    setContent(quote.content);
    setIsEditing(true);
  };
  
  const handleCreateNew = () => {
    setSelectedQuote(null);
    setAnimeId('');
    setAnimeName('');
    setAnimeAltName('');
    setCharacterId('');
    setCharacterName('');
    setContent('');
    setIsEditing(true);
  };
  
  const handleSave = () => {
    const newQuote: AnimeQuote = {
      anime: {
        id: parseInt(animeId) || 0,
        name: animeName,
        ...(animeAltName ? { altName: animeAltName } : {})
      },
      character: {
        id: parseInt(characterId) || 0,
        name: characterName
      },
      content
    };
    
    if (selectedQuote) {
      // Update existing quote
      setQuotes(quotes.map(q => 
        q === selectedQuote ? newQuote : q
      ));
    } else {
      // Add new quote
      setQuotes([...quotes, newQuote]);
    }
    
    if (onSave) {
      onSave(newQuote);
    }
    
    setIsEditing(false);
  };
  
  const handleDelete = (quote: AnimeQuote) => {
    setQuotes(quotes.filter(q => q !== quote));
    if (selectedQuote === quote) {
      setIsEditing(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h2 className="text-xl font-semibold mb-3">Anime Quote Management</h2>
      
      {isEditing ? (
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h3 className="font-medium mb-3">
            {selectedQuote ? 'Edit Quote' : 'Add New Quote'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anime ID
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={animeId}
                onChange={(e) => setAnimeId(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anime Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={animeName}
                onChange={(e) => setAnimeName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anime Alt Name (optional)
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={animeAltName}
                onChange={(e) => setAnimeAltName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Character ID
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Character Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quote Content
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button 
              className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button 
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              onClick={handleSave}
              disabled={!animeName || !characterName || !content}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <button 
          className="mb-4 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md"
          onClick={handleCreateNew}
        >
          Add New Quote
        </button>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anime
              </th>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Character
              </th>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quote
              </th>
              <th className="py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quotes.map((quote, index) => (
              <tr key={index}>
                <td className="py-2 px-4">
                  <div className="font-medium">{quote.anime.name}</div>
                  {quote.anime.altName && (
                    <div className="text-xs text-gray-500">{quote.anime.altName}</div>
                  )}
                </td>
                <td className="py-2 px-4">
                  {quote.character.name}
                </td>
                <td className="py-2 px-4">
                  <div className="truncate max-w-xs">
                    {quote.content}
                  </div>
                </td>
                <td className="py-2 px-4 text-right">
                  <button
                    className="mr-2 py-1 px-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-sm"
                    onClick={() => handleEditQuote(quote)}
                  >
                    Edit
                  </button>
                  <button
                    className="py-1 px-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm"
                    onClick={() => handleDelete(quote)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnimeQuoteAdmin; 