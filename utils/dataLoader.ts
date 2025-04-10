import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { Asset } from 'expo-asset';
import { Word, Language, Level } from '../types';

// Languages available in the app
const AVAILABLE_LANGUAGES = [
  { id: 'spanish', name: 'Spanish' },
  { id: 'french', name: 'French' },
  { id: 'german', name: 'German' },
  { id: 'japanese', name: 'Japanese' },
  { id: 'korean', name: 'Korean' },
  { id: 'arabic', name: 'Arabic' },
  { id: 'russian', name: 'Russian' },
  { id: 'sanskrit', name: 'Sanskrit' },
];

// Map language IDs to their respective asset requires
// This fixes the dynamic require issue
const LANGUAGE_FILES = {
  spanish: require('../assets/data/Spanish.csv'),
  french: require('../assets/data/French.csv'),
  japanese: require('../assets/data/Japanese.csv'),
  // Add other languages as they become available
  // german: require('../assets/german.csv'),
  // korean: require('../assets/korean.csv'),
  arabic: require('../assets/data/Arabic.csv'),
  // russian: require('../assets/russian.csv'),
  // sanskrit: require('../assets/sanskrit.csv'),
};

// Log available language files for debugging
console.log('Available language files:', Object.keys(LANGUAGE_FILES));

// Function to load a CSV file
const loadCSV = async (filePath: string): Promise<Word[]> => {
  try {
    // Get the language ID from the file path (remove .csv)
    const langId = filePath.replace('.csv', '');
    
    // Check if we have this language file
    if (!LANGUAGE_FILES[langId as keyof typeof LANGUAGE_FILES]) {
      console.warn(`CSV file for language "${langId}" not found`);
      return [];
    }
    
    // Use the static require from our mapping
    const asset = Asset.fromModule(LANGUAGE_FILES[langId as keyof typeof LANGUAGE_FILES]);
    await asset.downloadAsync();
    
    if (!asset.localUri) {
      throw new Error(`Failed to get local URI for ${filePath}`);
    }
    
    const fileContent = await FileSystem.readAsStringAsync(asset.localUri);
    console.log(`Loaded CSV for ${langId}, content length: ${fileContent.length}`);
    
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
        complete: (results) => {
          console.log(`CSV parsing complete, ${results.data.length} rows found`);
          
          if (results.data.length === 0) {
            console.warn('No data found in CSV file');
            resolve([]);
            return;
          }
          
          // Log a sample of the parsed data for debugging
          console.log('Sample parsed data:', results.data[0]);
          
          // Extract column names from the first row
          const firstRow = results.data[0] as Record<string, string>;
          const columns = Object.keys(firstRow);
          
          if (columns.length < 2) {
            console.warn(`Not enough columns found in CSV: ${columns.join(', ')}`);
            resolve([]);
            return;
          }
          
          const originalColumn = columns[0];
          const translationColumn = columns[1];
          
          console.log(`Using columns: "${originalColumn}" for original, "${translationColumn}" for translation`);
          
          const words: Word[] = results.data
            .filter((row: any) => row[originalColumn] && row[translationColumn]) // Both columns must have values
            .map((row: any, index: number) => {
              return {
                id: index + 1,
                original: row[originalColumn].trim(),
                translation: row[translationColumn].trim()
              };
            });
          
          console.log(`Processed ${words.length} valid words`);
          resolve(words);
        },
        error: (error: Error) => {
          console.error(`Error parsing CSV: ${error.message}`);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`Error loading CSV file ${filePath}:`, error);
    return [];
  }
};

// Function to generate levels from words
const generateLevels = (words: Word[], wordsPerLevel: number = 5): Level[] => {
  const shuffledWords = [...words].sort(() => Math.random() - 0.5);
  const levels: Level[] = [];
  
  for (let i = 0; i < Math.min(10, Math.floor(shuffledWords.length / wordsPerLevel)); i++) {
    const levelWords = shuffledWords.slice(i * wordsPerLevel, (i + 1) * wordsPerLevel);
    levels.push({
      id: i + 1,
      name: `Level ${i + 1}`,
      words: levelWords,
      completed: false,
      score: 0
    });
  }
  
  return levels;
};

// Function to load all languages
export const loadAllLanguages = async (wordsPerLevel: number = 5): Promise<Language[]> => {
  const languages: Language[] = [];
  
  for (const lang of AVAILABLE_LANGUAGES) {
    try {
      // Only load languages that we have CSV files for
      if (LANGUAGE_FILES[lang.id as keyof typeof LANGUAGE_FILES]) {
        const words = await loadCSV(`${lang.id}.csv`);
        
        if (words.length > 0) {
          const levels = generateLevels(words, wordsPerLevel);
          
          languages.push({
            id: lang.id,
            name: lang.name,
            words,
            levels,
            progress: 0
          });
          
          console.log(`Loaded language ${lang.name} with ${words.length} words and ${levels.length} levels`);
        } else {
          console.warn(`No words loaded for language ${lang.name}`);
        }
      }
    } catch (error) {
      console.error(`Error loading language ${lang.name}:`, error);
    }
  }
  
  return languages;
};

// Function to load a specific language
export const loadLanguage = async (languageId: string, wordsPerLevel: number = 5): Promise<Language | null> => {
  const lang = AVAILABLE_LANGUAGES.find(l => l.id === languageId);
  
  if (!lang || !LANGUAGE_FILES[languageId as keyof typeof LANGUAGE_FILES]) {
    return null;
  }
  
  try {
    const words = await loadCSV(`${lang.id}.csv`);
    
    if (words.length > 0) {
      const levels = generateLevels(words, wordsPerLevel);
      
      return {
        id: lang.id,
        name: lang.name,
        words,
        levels,
        progress: 0
      };
    } else {
      console.warn(`No words loaded for language ${lang.name}`);
    }
  } catch (error) {
    console.error(`Error loading language ${lang.name}:`, error);
  }
  
  return null;
}; 