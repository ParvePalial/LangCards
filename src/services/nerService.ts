import { GoogleGenerativeAI } from '@google/generative-ai';
import { NerResponse, NerEntity } from '../types';
import axios from 'axios';

// Get API key from environment variables
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyAFrAsWP_lLSh43KWws0jdplwzKFQUbFMo';
const genAI = new GoogleGenerativeAI(API_KEY);

// Backend API URL for spaCy processing
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

// A simplified fallback in case both API calls fail
const getSimpleFallbackPosData = (text: string): NerResponse => {
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const entities: NerEntity[] = [];
  
  let currentPosition = 0;
  
  words.forEach(word => {
    const start = text.indexOf(word, currentPosition);
    if (start !== -1) {
      const end = start + word.length;
      
      entities.push({
        word,
        type: "NOUN", // Default to NOUN as fallback
        position: [start, end]
      });
      
      currentPosition = end;
    }
  });
  
  return { entities };
};

export const analyzeText = async (text: string, language: string): Promise<NerResponse> => {
  if (!text || text.trim().length === 0) {
    return { entities: [] };
  }
  
  // Try spaCy backend first (most accurate)
  try {
    console.log('Analyzing text with spaCy backend...');
    const response = await axios.post(`${BACKEND_API_URL}/analyze-pos`, {
      text,
      language
    });
    
    if (response.data && response.data.entities && Array.isArray(response.data.entities)) {
      console.log('Successfully received spaCy analysis');
      return response.data;
    }
    
    throw new Error('Invalid response format from spaCy backend');
  } catch (backendError) {
    console.error('spaCy backend analysis failed:', backendError);
    
    // Fall back to Gemini model
    try {
      console.log('Falling back to Gemini model...');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Task: Perform part-of-speech tagging on the text below.
        
        Text in ${language}: "${text}"
        
        Instructions:
        1. Tag each significant word with its part of speech.
        2. Include the position (start and end indices) of each word in the original text.
        3. Return ONLY a valid JSON object with the following structure:
        
        {
          "entities": [
            {
              "word": "example",
              "type": "NOUN",
              "position": [0, 7]
            },
            ...
          ]
        }
        
        Use these part-of-speech tags:
        - NOUN: Nouns (common nouns like 'house', 'tree')
        - VERB: Verbs (action words like 'run', 'think')
        - ADJ: Adjectives (descriptive words like 'blue', 'happy')
        - ADV: Adverbs (modify verbs like 'quickly', 'very')
        - PROPN: Proper nouns (names of people, places like 'John', 'Paris')
        - PRON: Pronouns ('I', 'you', 'she')
        - DET: Determiners ('the', 'a', 'this')
        - ADP: Adpositions (prepositions like 'in', 'on', 'by')
        - CONJ: Conjunctions ('and', 'or', 'but')
        
        Respond with ONLY the JSON object and nothing else.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const textValue = response.text();
      
      // Extract the JSON from the response
      const jsonMatch = textValue.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : '{"entities": []}';
      
      try {
        const parsedResult = JSON.parse(jsonString) as NerResponse;
        
        // Validate the response structure
        if (!parsedResult.entities || !Array.isArray(parsedResult.entities)) {
          throw new Error("Invalid entity structure");
        }
        
        // Filter out any malformed entities
        parsedResult.entities = parsedResult.entities.filter(entity => 
          entity && entity.word && entity.type && 
          Array.isArray(entity.position) && entity.position.length === 2
        );
        
        return parsedResult;
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError, jsonString);
        // Fall back to basic fallback
        return getSimpleFallbackPosData(text);
      }
    } catch (geminiError) {
      console.error('Gemini analysis error:', geminiError);
      // Return simple fallback POS data
      return getSimpleFallbackPosData(text);
    }
  }
}; 