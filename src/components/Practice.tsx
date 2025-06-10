import React, { useState, useEffect } from 'react';
import { FlashcardItem } from '../types';
import { getFlashcards } from '../services/flashcardService';
import { getLanguageName } from '../utils/languageOptions';
import LanguageSelector from './LanguageSelector';

const Practice: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [filteredCards, setFilteredCards] = useState<FlashcardItem[]>([]);
  const [currentCard, setCurrentCard] = useState<FlashcardItem | null>(null);
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [languagePairs, setLanguagePairs] = useState<string[]>([]);

  useEffect(() => {
    const cards = getFlashcards();
    setFlashcards(cards);
    
    // Extract unique language pairs
    const pairs = Array.from(
      new Set(cards.map(card => `${card.sourceLanguage}-${card.targetLanguage}`))
    );
    setLanguagePairs(pairs);
    
    if (pairs.length > 0) {
      const [src, tgt] = pairs[0].split('-');
      setSourceLanguage(src);
      setTargetLanguage(tgt);
    }
  }, []);

  useEffect(() => {
    if (sourceLanguage && targetLanguage) {
      const filtered = flashcards.filter(
        card => card.sourceLanguage === sourceLanguage && card.targetLanguage === targetLanguage
      );
      setFilteredCards(filtered);
      nextCard(filtered);
    }
  }, [sourceLanguage, targetLanguage, flashcards]);

  const nextCard = (cards = filteredCards) => {
    setShowAnswer(false);
    setAnswer('');
    setResult(null);
    
    if (cards.length === 0) {
      setCurrentCard(null);
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentCard(cards[randomIndex]);
  };

  const handleLanguagePairChange = (pair: string) => {
    const [src, tgt] = pair.split('-');
    setSourceLanguage(src);
    setTargetLanguage(tgt);
  };

  const checkAnswer = () => {
    if (!currentCard) return;
    
    // Simple check - could be enhanced with more sophisticated comparison
    const isCorrect = answer.toLowerCase().trim() === currentCard.translation.toLowerCase().trim();
    setResult(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Practice Flashcards</h2>
        
        {languagePairs.length > 0 ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Language Pair
            </label>
            <select
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={`${sourceLanguage}-${targetLanguage}`}
              onChange={(e) => handleLanguagePairChange(e.target.value)}
            >
              {languagePairs.map(pair => {
                const [src, tgt] = pair.split('-');
                return (
                  <option key={pair} value={pair}>
                    {getLanguageName(src)} to {getLanguageName(tgt)}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg mb-6">
            <p className="text-gray-600">No flashcards available for practice.</p>
            <p className="text-gray-500 mt-2">Add some flashcards in the translator section first.</p>
          </div>
        )}
        
        {currentCard && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                Translate this {getLanguageName(currentCard.sourceLanguage)} word:
              </p>
              <p className="text-2xl font-semibold">{currentCard.word}</p>
              <div className="mt-2 text-xs inline-block px-2 py-1 bg-gray-200 rounded-full">
                {currentCard.partOfSpeech}
              </div>
              <div className="mt-2 text-sm text-gray-700 p-2 bg-gray-100 rounded">
                <span className="font-medium">Meaning:</span> {currentCard.meaning}
              </div>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${getLanguageName(currentCard.targetLanguage)} translation...`}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                disabled={showAnswer}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-300"
                onClick={checkAnswer}
                disabled={!answer.trim() || showAnswer}
              >
                Check
              </button>
              <button
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                onClick={() => nextCard()}
              >
                Next Card
              </button>
            </div>
            
            {showAnswer && (
              <div className={`mt-4 p-4 rounded-lg ${
                result === 'correct' ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
              }`}>
                <p className="font-medium">
                  {result === 'correct' ? 'Correct!' : 'Incorrect!'}
                </p>
                <p className="mt-1">
                  The correct translation of "{currentCard.word}" is:
                  <span className="font-bold ml-2">
                    {currentCard.translation}
                  </span>
                </p>
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-sm">
                    <span className="font-medium">Part of Speech:</span> {currentCard.partOfSpeech}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Meaning:</span> {currentCard.meaning}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice; 