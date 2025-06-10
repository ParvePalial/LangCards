import React, { useState, useEffect } from 'react';
import { getRandomQuote } from '../utils/quoteUtils';
import { getRandomAnimeQuote, formatAnimeQuote } from '../utils/animeQuoteUtils';
import LanguageSelector from './LanguageSelector';
import TextWithPOS from './TextWithPOS';
import { translateText } from '../services/translationService';
import { analyzeText } from '../services/nerService';
import { addFlashcard } from '../services/flashcardService';
import { getLanguageName } from '../utils/languageOptions';
import { NerEntity, Translation } from '../types';

const Translator: React.FC = () => {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [entities, setEntities] = useState<NerEntity[]>([]);
  const [translatedEntities, setTranslatedEntities] = useState<NerEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosLoading, setIsPosLoading] = useState(false);
  const [isTranslatedPosLoading, setIsTranslatedPosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posError, setPosError] = useState<string | null>(null);
  const [translatedPosError, setTranslatedPosError] = useState<string | null>(null);
  const [showTranslatedAnalysis, setShowTranslatedAnalysis] = useState(false);

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (translation) {
      setInputText(translation.translatedText);
      setTranslation(null);
      setEntities([]);
      setTranslatedEntities([]);
      setShowTranslatedAnalysis(false);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate');
      return;
    }

    setError(null);
    setPosError(null);
    setTranslatedPosError(null);
    setIsLoading(true);
    setIsPosLoading(false); // Don't analyze original text by default
    setTranslatedEntities([]);
    setShowTranslatedAnalysis(false);

    try {
      // Translation
      const translationResult = await translateText(
        inputText,
        targetLanguage,
        sourceLanguage
      );
      setTranslation(translationResult);
      setEntities([]); // Clear original text entities
      
      // Automatically analyze translated text for POS tagging
      setIsTranslatedPosLoading(true);
      try {
        // POS analysis on translated text
        const posResult = await analyzeText(translationResult.translatedText, targetLanguage);
        setTranslatedEntities(posResult.entities);
        setShowTranslatedAnalysis(true);
      } catch (posErr) {
        console.error("POS analysis error:", posErr);
        setTranslatedPosError('Part of speech tagging failed for translated text');
        setTranslatedEntities([]);
      } finally {
        setIsTranslatedPosLoading(false);
      }
      
    } catch (err) {
      console.error("Translation error:", err);
      setError('Translation failed. Please try again or check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRandomQuote = async () => {
    setIsLoading(true);
    setError(null);
    setPosError(null);
    setTranslatedPosError(null);
    setTranslatedEntities([]);
    setShowTranslatedAnalysis(false);
    setInputText('Loading quote...');

    try {
      const quote = await getRandomQuote();
      setInputText(`"${quote.content}" - ${quote.author}`);
      setTranslation(null);
      setEntities([]);
    } catch (err) {
      console.error('Quote fetch error:', err);
      setError('Failed to fetch a quote. Using a default quote instead.');
      // Set a default quote as fallback
      setInputText('"The journey of a thousand miles begins with one step." - Lao Tzu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAnimeQuote = async () => {
    setIsLoading(true);
    setError(null);
    setPosError(null);
    setTranslatedPosError(null);
    setTranslatedEntities([]);
    setShowTranslatedAnalysis(false);
    setInputText('Loading anime quote...');

    try {
      console.log("Translator: Fetching anime quote...");
      const animeQuote = await getRandomAnimeQuote();
      console.log("Translator: Received anime quote:", animeQuote);
      
      if (animeQuote) {
        setInputText(formatAnimeQuote(animeQuote));
        setTranslation(null);
        setEntities([]);
      } else {
        throw new Error("Received null or undefined quote");
      }
    } catch (err) {
      console.error('Anime quote fetch error:', err);
      setError('Failed to fetch an anime quote. Using a default quote instead.');
      // Set a default quote as fallback
      setInputText('"I\'m pathetic. I was observing the world from a safe distance. I was just scared of being hurt. I was lonely." - Amano Yukiteru (The Future Diary)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center mb-4 gap-4">
          <div className="w-full md:w-2/5">
            <LanguageSelector
              value={sourceLanguage}
              onChange={setSourceLanguage}
              label="From Language"
              excludeCode={targetLanguage}
            />
          </div>
          
          <button 
            onClick={handleSwapLanguages}
            className="p-2 rounded-full hover:bg-gray-100 md:mt-6"
            aria-label="Swap languages"
          >
            ⇄
          </button>
          
          <div className="w-full md:w-2/5">
            <LanguageSelector
              value={targetLanguage}
              onChange={setTargetLanguage}
              label="To Language"
              excludeCode={sourceLanguage}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter text
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type text to translate..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-300"
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? 'Processing...' : 'Translate & Analyze POS'}
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <button
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md disabled:bg-gray-50 disabled:text-gray-400"
              onClick={handleGetRandomQuote}
              disabled={isLoading}
            >
              Get Random Quote
            </button>
            
            <button
              className="flex-1 py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md disabled:bg-gray-50 disabled:text-gray-400"
              onClick={handleGetAnimeQuote}
              disabled={isLoading}
            >
              Get Anime Quote
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Display translation results with POS tagging */}
      {translation && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Translation Results</h2>
          
          {/* Original text and translation display */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <p className="text-lg mb-4">{inputText}</p>
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Translation:</h3>
              <p className="text-lg">{translation.translatedText}</p>
            </div>
          </div>
          
          {/* POS analysis of translated text */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-3">Parts of Speech Analysis</h3>
            
            {translatedPosError && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                {translatedPosError}
              </div>
            )}
            
            {isTranslatedPosLoading ? (
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                <p>Analyzing parts of speech...</p>
              </div>
            ) : translatedEntities.length > 0 ? (
              <TextWithPOS
                text={translation.translatedText}
                entities={translatedEntities}
                sourceLanguage={targetLanguage}
                targetLanguage={sourceLanguage}
              />
            ) : (
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                <p>No part of speech data available for the translated text.</p>
              </div>
            )}
            
            {translatedEntities.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                Click on any highlighted word to add it to your flashcards.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Translator; 