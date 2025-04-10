import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Language, 
  Level, 
  UserProgress, 
  GameSettings, 
  Word
} from '../types';
import { loadAllLanguages, loadLanguage } from '../utils/dataLoader';

interface GameContextProps {
  languages: Language[];
  currentLanguage: Language | null;
  userProgress: UserProgress;
  gameSettings: GameSettings;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  setCurrentLanguage: (language: Language) => void;
  updateProgress: (languageId: string, levelId: number, score: number) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetProgress: () => void;
  getLevel: (languageId: string, levelId: number) => Level | null;
}

// Default game settings
const DEFAULT_SETTINGS: GameSettings = {
  wordsPerLevel: 5,
  timePerWord: 30,
  useImages: true,
  soundEnabled: true,
  imageProvider: 'openai',
};

// Default user progress
const DEFAULT_PROGRESS: UserProgress = {
  languages: {},
  totalScore: 0,
};

// Create context
const GameContext = createContext<GameContextProps | undefined>(undefined);

// Create provider
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load languages and user data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load settings from storage
        const storedSettings = await AsyncStorage.getItem('gameSettings');
        if (storedSettings) {
          setGameSettings(JSON.parse(storedSettings));
        }
        
        // Load progress from storage
        const storedProgress = await AsyncStorage.getItem('userProgress');
        if (storedProgress) {
          setUserProgress(JSON.parse(storedProgress));
        }
        
        // Load languages
        const loadedLanguages = await loadAllLanguages(gameSettings.wordsPerLevel);
        setLanguages(loadedLanguages);
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setIsLoading(false);
        console.error('Error loading data:', err);
      }
    };
    
    loadData();
  }, []);

  // Save settings to storage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('gameSettings', JSON.stringify(gameSettings));
      } catch (err) {
        console.error('Error saving settings:', err);
      }
    };
    
    saveSettings();
  }, [gameSettings]);

  // Save progress to storage whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await AsyncStorage.setItem('userProgress', JSON.stringify(userProgress));
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    };
    
    saveProgress();
  }, [userProgress]);

  // Set the current language
  const handleSetCurrentLanguage = async (language: Language) => {
    try {
      // If the language is already selected, just update the state
      if (currentLanguage?.id === language.id) {
        setCurrentLanguage(language);
        return;
      }
      
      // Otherwise, load the language data
      const loadedLanguage = await loadLanguage(language.id, gameSettings.wordsPerLevel);
      
      if (loadedLanguage) {
        // If we have progress for this language, update the loaded language with it
        if (userProgress.languages[language.id]) {
          const langProgress = userProgress.languages[language.id];
          
          // Mark completed levels
          loadedLanguage.levels = loadedLanguage.levels.map(level => ({
            ...level,
            completed: langProgress.completedLevels.includes(level.id),
            score: langProgress.completedLevels.includes(level.id) ? 100 : 0
          }));
          
          // Update progress
          loadedLanguage.progress = 
            (langProgress.completedLevels.length / loadedLanguage.levels.length) * 100;
        }
        
        setCurrentLanguage(loadedLanguage);
      }
    } catch (err) {
      console.error('Error setting current language:', err);
    }
  };

  // Update progress for a level
  const updateProgress = (languageId: string, levelId: number, score: number) => {
    setUserProgress(prev => {
      // Create a copy of the previous state
      const newProgress = { ...prev };
      
      // If this is the first time completing a level in this language
      if (!newProgress.languages[languageId]) {
        newProgress.languages[languageId] = {
          currentLevel: levelId + 1,
          totalScore: score,
          completedLevels: score >= 70 ? [levelId] : []
        };
      } else {
        const langProgress = newProgress.languages[languageId];
        
        // Update the current level if this level is completed
        if (score >= 70 && levelId >= langProgress.currentLevel) {
          langProgress.currentLevel = levelId + 1;
        }
        
        // Add to completed levels if not already there and score is sufficient
        if (score >= 70 && !langProgress.completedLevels.includes(levelId)) {
          langProgress.completedLevels.push(levelId);
        }
        
        // Update total score
        langProgress.totalScore += score;
      }
      
      // Update total score
      newProgress.totalScore += score;
      
      return newProgress;
    });
    
    // Update the current language state if it's the active language
    if (currentLanguage?.id === languageId) {
      setCurrentLanguage(prev => {
        if (!prev) return null;
        
        const updatedLevels = prev.levels.map(level => {
          if (level.id === levelId) {
            return {
              ...level,
              completed: score >= 70,
              score
            };
          }
          return level;
        });
        
        const completedLevels = updatedLevels.filter(level => level.completed).length;
        
        return {
          ...prev,
          levels: updatedLevels,
          progress: (completedLevels / updatedLevels.length) * 100
        };
      });
    }
    
    // Update the languages list
    setLanguages(prev => {
      return prev.map(lang => {
        if (lang.id === languageId) {
          const updatedLevels = lang.levels.map(level => {
            if (level.id === levelId) {
              return {
                ...level,
                completed: score >= 70,
                score
              };
            }
            return level;
          });
          
          const completedLevels = updatedLevels.filter(level => level.completed).length;
          
          return {
            ...lang,
            levels: updatedLevels,
            progress: (completedLevels / updatedLevels.length) * 100
          };
        }
        return lang;
      });
    });
  };

  // Update game settings
  const updateSettings = (settings: Partial<GameSettings>) => {
    setGameSettings(prev => ({ ...prev, ...settings }));
  };

  // Reset all progress
  const resetProgress = () => {
    setUserProgress(DEFAULT_PROGRESS);
    
    // Reset progress in all languages
    setLanguages(prev => {
      return prev.map(lang => {
        const resetLevels = lang.levels.map(level => ({
          ...level,
          completed: false,
          score: 0
        }));
        
        return {
          ...lang,
          levels: resetLevels,
          progress: 0
        };
      });
    });
    
    // Reset current language if set
    if (currentLanguage) {
      setCurrentLanguage(prev => {
        if (!prev) return null;
        
        const resetLevels = prev.levels.map(level => ({
          ...level,
          completed: false,
          score: 0
        }));
        
        return {
          ...prev,
          levels: resetLevels,
          progress: 0
        };
      });
    }
  };

  // Get a specific level
  const getLevel = (languageId: string, levelId: number): Level | null => {
    if (currentLanguage?.id === languageId) {
      return currentLanguage.levels.find(level => level.id === levelId) || null;
    }
    
    const language = languages.find(lang => lang.id === languageId);
    if (language) {
      return language.levels.find(level => level.id === levelId) || null;
    }
    
    return null;
  };

  const contextValue: GameContextProps = {
    languages,
    currentLanguage,
    userProgress,
    gameSettings,
    isLoading,
    error,
    setCurrentLanguage: handleSetCurrentLanguage,
    updateProgress,
    updateSettings,
    resetProgress,
    getLevel
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Create hook for using the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 