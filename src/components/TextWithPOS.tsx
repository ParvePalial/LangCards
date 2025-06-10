import React, { useState } from 'react';
import { NerEntity } from '../types';
import { addFlashcard } from '../services/flashcardService';
import { getLanguageName } from '../utils/languageOptions';

interface TextWithPOSProps {
  text: string;
  entities: NerEntity[];
  translatedText?: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Color mapping for different POS types
const posTypeColors: Record<string, string> = {
  'NOUN': 'bg-blue-100 border-blue-400',
  'VERB': 'bg-green-100 border-green-400',
  'ADJ': 'bg-yellow-100 border-yellow-400',
  'ADV': 'bg-purple-100 border-purple-400',
  'PROPN': 'bg-red-100 border-red-400',
  'NUM': 'bg-gray-100 border-gray-400',
  'DET': 'bg-pink-100 border-pink-400',
  'PRON': 'bg-indigo-100 border-indigo-400',
  'ADP': 'bg-orange-100 border-orange-400',
  'CONJ': 'bg-teal-100 border-teal-400',
  'PART': 'bg-cyan-100 border-cyan-400',
};

// Descriptions for part of speech types
const posDescriptions: Record<string, string> = {
  'NOUN': 'A word that represents a person, place, thing, or idea',
  'VERB': 'A word that expresses an action, occurrence, or state of being',
  'ADJ': 'A word that describes or modifies a noun',
  'ADV': 'A word that modifies a verb, adjective, or other adverb',
  'PROPN': 'A proper noun representing a unique entity (name, place, organization)',
  'NUM': 'A numeral or number word',
  'DET': 'A determiner that introduces a noun (the, a, an, this, that)',
  'PRON': 'A word that substitutes for a noun (I, you, he, she, it)',
  'ADP': 'An adposition like prepositions (in, on, under) or postpositions',
  'CONJ': 'A conjunction that connects words or phrases (and, but, or)',
  'PART': 'A particle word that has grammatical function',
};

const getColorForType = (type: string): string => {
  return posTypeColors[type] || 'bg-gray-100 border-gray-400';
};

const getMeaningForType = (type: string): string => {
  return posDescriptions[type] || 'A word or term in the language';
};

const TextWithPOS: React.FC<TextWithPOSProps> = ({ 
  text, 
  entities,
  translatedText,
  sourceLanguage,
  targetLanguage
}) => {
  const [flashcardAdded, setFlashcardAdded] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<NerEntity | null>(null);
  const [customMeaning, setCustomMeaning] = useState('');
  const [showMeaningModal, setShowMeaningModal] = useState(false);

  const openMeaningModal = (entity: NerEntity) => {
    const word = text.substring(entity.position[0], entity.position[1]);
    setSelectedEntity(entity);
    setCustomMeaning(getMeaningForType(entity.type));
    setShowMeaningModal(true);
  };

  const handleSaveFlashcard = () => {
    if (!selectedEntity) return;
    
    const word = text.substring(selectedEntity.position[0], selectedEntity.position[1]);
    const meaning = customMeaning.trim() || getMeaningForType(selectedEntity.type);
    
    // If we have a translation, use the full translated text as context
    let translation = translatedText || '';
    
    addFlashcard({
      word,
      translation,
      meaning,
      partOfSpeech: selectedEntity.type,
      sourceLanguage,
      targetLanguage
    });
    
    setFlashcardAdded(word);
    setShowMeaningModal(false);
    setTimeout(() => setFlashcardAdded(null), 2000);
  };

  const handleAddAllWords = () => {
    if (sortedEntities.length === 0) return;
    
    // Add all words at once as separate flashcards
    sortedEntities.forEach(entity => {
      const word = text.substring(entity.position[0], entity.position[1]);
      addFlashcard({
        word,
        translation: translatedText || '',
        meaning: getMeaningForType(entity.type),
        partOfSpeech: entity.type,
        sourceLanguage,
        targetLanguage
      });
    });
    
    alert(`Added ${sortedEntities.length} words to flashcards!`);
  };

  // Create an array of text segments with entity information
  const segments: { text: string; entity: NerEntity | null }[] = [];
  let lastIndex = 0;

  // Sort entities by position
  const sortedEntities = [...entities].sort((a, b) => a.position[0] - b.position[0]);

  // Create segments
  sortedEntities.forEach(entity => {
    const [start, end] = entity.position;
    
    // Add text before this entity
    if (start > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, start),
        entity: null
      });
    }
    
    // Add the entity text
    segments.push({
      text: text.substring(start, end),
      entity
    });
    
    lastIndex = end;
  });
  
  // Add remaining text after last entity
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      entity: null
    });
  }

  return (
    <div className="relative p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {flashcardAdded && (
        <div className="absolute top-2 right-2 py-2 px-4 bg-green-100 text-green-800 rounded-md shadow-sm border border-green-300 z-10 animate-fade-in-out">
          Added "{flashcardAdded}" to flashcards!
        </div>
      )}
      
      {/* Meaning Modal */}
      {showMeaningModal && selectedEntity && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Add "{text.substring(selectedEntity.position[0], selectedEntity.position[1])}" to Flashcards
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className={`inline-block px-2 py-1 text-xs rounded mr-2 ${getColorForType(selectedEntity.type)}`}>
                  {selectedEntity.type}
                </span>
                <span className="text-sm text-gray-600">Part of Speech</span>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meaning
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                value={customMeaning}
                onChange={(e) => setCustomMeaning(e.target.value)}
                placeholder="Enter the meaning of this word..."
              />
              <p className="text-xs text-gray-500 mt-1">
                A default meaning is provided based on the part of speech. Feel free to modify it.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                onClick={() => setShowMeaningModal(false)}
              >
                Cancel
              </button>
              <button 
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                onClick={handleSaveFlashcard}
              >
                Add to Flashcards
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-lg leading-relaxed">
        {segments.map((segment, index) => (
          segment.entity ? (
            <span 
              key={index}
              className={`relative cursor-pointer border-b-2 px-0.5 mx-0.5 rounded hover:bg-opacity-80 ${getColorForType(segment.entity.type)}`}
              title={`${segment.entity.type} - Click to add to flashcards`}
              onClick={() => openMeaningModal(segment.entity!)}
            >
              {segment.text}
              <span className="absolute top-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 hover:opacity-100 transition-opacity">
                {segment.entity.type}
              </span>
            </span>
          ) : (
            <span key={index}>{segment.text}</span>
          )
        ))}
      </div>
      
      {translatedText && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Translation ({getLanguageName(targetLanguage)}):
          </h3>
          <p className="text-lg">{translatedText}</p>
        </div>
      )}

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Parts of Speech:</h4>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(entities.map(e => e.type))).map(type => (
            <div key={type} className={`text-xs px-2 py-1 rounded border ${getColorForType(type)}`}>
              {type}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <button 
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          onClick={handleAddAllWords}
        >
          Add All Words to Flashcards
        </button>
      </div>
    </div>
  );
};

export default TextWithPOS; 