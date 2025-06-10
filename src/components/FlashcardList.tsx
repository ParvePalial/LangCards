import React, { useState, useEffect } from 'react';
import { FlashcardItem } from '../types';
import { getFlashcards, deleteFlashcard, getFlashcardsByPartOfSpeech } from '../services/flashcardService';
import { getLanguageName } from '../utils/languageOptions';

const FlashcardList: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [posFilter, setPosFilter] = useState<string>('all');

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = () => {
    const cards = getFlashcards();
    setFlashcards(cards);
    setCurrentIndex(cards.length > 0 ? 0 : -1);
    setIsFlipped(false);
  };

  const handleDelete = (id: string) => {
    deleteFlashcard(id);
    loadFlashcards();
  };

  const nextCard = () => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Filter flashcards by language and part of speech
  const filteredFlashcards = flashcards
    .filter(card => 
      languageFilter === 'all' || `${card.sourceLanguage}-${card.targetLanguage}` === languageFilter
    )
    .filter(card => 
      posFilter === 'all' || card.partOfSpeech === posFilter
    );

  // Get unique language pairs
  const languagePairs = Array.from(
    new Set(flashcards.map(card => `${card.sourceLanguage}-${card.targetLanguage}`))
  );

  // Get unique parts of speech
  const partsOfSpeech = Array.from(
    new Set(flashcards.map(card => card.partOfSpeech))
  ).filter(pos => pos); // Filter out empty strings

  // Format date for display
  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Filter Flashcards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language Pair
            </label>
            <select
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <option value="all">All languages</option>
              {languagePairs.map(pair => {
                const [source, target] = pair.split('-');
                return (
                  <option key={pair} value={pair}>
                    {getLanguageName(source)} to {getLanguageName(target)}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part of Speech
            </label>
            <select
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={posFilter}
              onChange={(e) => setPosFilter(e.target.value)}
            >
              <option value="all">All parts of speech</option>
              {partsOfSpeech.map(pos => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
          <p>Total cards: {flashcards.length} | Filtered: {filteredFlashcards.length}</p>
        </div>
      </div>

      {filteredFlashcards.length > 0 ? (
        <div>
          <div 
            className="h-72 w-full bg-white border border-gray-200 rounded-lg shadow-md cursor-pointer transition-transform duration-500 ease-in-out"
            onClick={toggleFlip}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-sm text-gray-500 mb-2">
                {getLanguageName(filteredFlashcards[currentIndex].sourceLanguage)}
              </p>
              <p className="text-3xl font-semibold mb-4">
                {filteredFlashcards[currentIndex].word}
              </p>
              <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs text-gray-800 mb-2">
                {filteredFlashcards[currentIndex].partOfSpeech}
              </span>
              
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-700">
                  {filteredFlashcards[currentIndex].meaning}
                </p>
              </div>
              
              {filteredFlashcards[currentIndex].context && (
                <p className="text-sm text-gray-600 italic mt-3 text-center">
                  "{filteredFlashcards[currentIndex].context}"
                </p>
              )}
              
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                Click to flip
              </div>
            </div>
            
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <p className="text-sm text-gray-500 mb-2">
                {getLanguageName(filteredFlashcards[currentIndex].targetLanguage)}
              </p>
              
              {filteredFlashcards[currentIndex].translatedWord ? (
                <>
                  <p className="text-3xl font-semibold mb-2">
                    {filteredFlashcards[currentIndex].translatedWord}
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Full translation: {filteredFlashcards[currentIndex].translation}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-semibold">
                  {filteredFlashcards[currentIndex].translation}
                </p>
              )}
              
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                Click to flip
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button 
              onClick={prevCard}
              disabled={currentIndex <= 0}
              className={`px-4 py-2 rounded-lg ${
                currentIndex <= 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700">
              {currentIndex + 1} of {filteredFlashcards.length}
            </span>
            <button
              onClick={nextCard}
              disabled={currentIndex >= filteredFlashcards.length - 1}
              className={`px-4 py-2 rounded-lg ${
                currentIndex >= filteredFlashcards.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Next
            </button>
          </div>

          <button
            onClick={() => handleDelete(filteredFlashcards[currentIndex].id)}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Delete Card
          </button>
        </div>
      ) : (
        <div className="text-center p-10 bg-white rounded-lg border border-gray-200">
          <p className="text-xl text-gray-600">No flashcards found</p>
          <p className="text-gray-500 mt-2">
            {flashcards.length > 0 
              ? 'Try selecting different filter options' 
              : 'Start by adding words from the translator'}
          </p>
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-medium mb-3">All Flashcards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlashcards.map((card) => (
              <div 
                key={card.id} 
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{card.word}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded text-white ${card.partOfSpeech === 'NOUN' ? 'bg-blue-500' : card.partOfSpeech === 'VERB' ? 'bg-green-500' : card.partOfSpeech === 'ADJ' ? 'bg-yellow-500' : card.partOfSpeech === 'PROPN' ? 'bg-red-500' : 'bg-gray-500'}`}>
                          {card.partOfSpeech}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    
                    {card.translatedWord ? (
                      <div className="mt-1">
                        <p className="text-sm font-medium">{card.translatedWord}</p>
                        <p className="text-xs text-gray-600">({card.translation})</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{card.translation}</p>
                    )}
                    
                    <p className="text-xs text-gray-800 mt-2 border-l-2 border-gray-300 pl-2">
                      {card.meaning}
                    </p>
                    
                    {card.context && (
                      <p className="text-xs text-gray-500 mt-1 italic">"{card.context}"</p>
                    )}
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>
                        {getLanguageName(card.sourceLanguage)} → {getLanguageName(card.targetLanguage)}
                      </span>
                      <span>
                        {formatDate(card.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardList; 