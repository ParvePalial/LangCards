import { FlashcardItem } from '../types';

const STORAGE_KEY = 'language-learning-flashcards';

// Get all flashcards from localStorage
export const getFlashcards = (): FlashcardItem[] => {
  const flashcardsJson = localStorage.getItem(STORAGE_KEY);
  return flashcardsJson ? JSON.parse(flashcardsJson) : [];
};

// Add a new flashcard
export const addFlashcard = (flashcard: Omit<FlashcardItem, 'id' | 'createdAt'>): FlashcardItem => {
  const flashcards = getFlashcards();
  
  // Check if a similar flashcard already exists
  const existingSimilarCard = flashcards.find(
    card => card.word === flashcard.word && 
           card.sourceLanguage === flashcard.sourceLanguage &&
           card.targetLanguage === flashcard.targetLanguage
  );
  
  // If a similar card exists, update it rather than creating a duplicate
  if (existingSimilarCard) {
    const updatedCard: FlashcardItem = {
      ...existingSimilarCard,
      translation: flashcard.translation || existingSimilarCard.translation,
      meaning: flashcard.meaning || existingSimilarCard.meaning || 'No definition provided',
      partOfSpeech: flashcard.partOfSpeech || existingSimilarCard.partOfSpeech,
      context: flashcard.context || existingSimilarCard.context,
      translatedWord: flashcard.translatedWord || existingSimilarCard.translatedWord,
      createdAt: new Date() // Update the timestamp
    };
    
    const updatedFlashcards = flashcards.map(card => 
      card.id === existingSimilarCard.id ? updatedCard : card
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFlashcards));
    return updatedCard;
  }
  
  // Create a new flashcard if no similar one exists
  const newFlashcard: FlashcardItem = {
    ...flashcard,
    meaning: flashcard.meaning || 'No definition provided',
    id: Date.now().toString(),
    createdAt: new Date()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...flashcards, newFlashcard]));
  return newFlashcard;
};

// Add multiple flashcards at once
export const addMultipleFlashcards = (
  flashcards: Omit<FlashcardItem, 'id' | 'createdAt'>[]
): FlashcardItem[] => {
  const newFlashcards: FlashcardItem[] = flashcards.map(card => addFlashcard(card));
  return newFlashcards;
};

// Delete a flashcard
export const deleteFlashcard = (id: string): void => {
  const flashcards = getFlashcards();
  const updatedFlashcards = flashcards.filter(card => card.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFlashcards));
};

// Get flashcards filtered by language
export const getFlashcardsByLanguage = (sourceLanguage: string, targetLanguage: string): FlashcardItem[] => {
  const flashcards = getFlashcards();
  return flashcards.filter(
    card => card.sourceLanguage === sourceLanguage && card.targetLanguage === targetLanguage
  );
};

// Get flashcards filtered by part of speech
export const getFlashcardsByPartOfSpeech = (partOfSpeech: string): FlashcardItem[] => {
  const flashcards = getFlashcards();
  return flashcards.filter(card => card.partOfSpeech === partOfSpeech);
};

// Get total flashcards count
export const getFlashcardsCount = (): number => {
  return getFlashcards().length;
}; 