import OpenAI from 'openai';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from '@google/generative-ai';

// AI clients
let openai: OpenAI | null = null;
let gemini: GoogleGenerativeAI | null = null;

// Provider types
export type ImageProvider = 'openai' | 'gemini';

interface ImageGenerationOptions {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  provider?: ImageProvider;
}

// Initialize OpenAI client with API key
export const initializeOpenAI = (apiKey: string): boolean => {
  try {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend service
    });
    return true;
  } catch (error) {
    console.error('Error initializing OpenAI:', error);
    return false;
  }
};

// Initialize Gemini client with API key
export const initializeGemini = (apiKey: string): boolean => {
  try {
    gemini = new GoogleGenerativeAI(apiKey);
    return true;
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    return false;
  }
};

// Generate image with OpenAI
const generateOpenAIImage = async (prompt: string, size: string): Promise<string | null> => {
  if (!openai) {
    console.error('OpenAI client not initialized');
    return null;
  }

  try {
    const result = await openai.images.generate({
      model: "dall-e-2", // Using DALL-E 2 for simpler images
      prompt: `Simple sketch of ${prompt}, minimalist line drawing style, black and white`,
      n: 1,
      size: size as '256x256' | '512x512' | '1024x1024',
      quality: 'standard',
      style: 'vivid',
    });

    if (result.data && result.data.length > 0 && result.data[0].url) {
      return result.data[0].url;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error generating image with OpenAI:', error);
    
    // Check for billing limit errors
    if (error.message && (
        error.message.includes('billing') || 
        error.message.includes('quota') || 
        error.message.includes('limit') ||
        error.message.includes('429') || 
        error.status === 429
      )) {
      throw new Error('API_QUOTA_EXCEEDED');
    }
    
    return null;
  }
};

// Generate image with Gemini
const generateGeminiImage = async (prompt: string): Promise<string | null> => {
  if (!gemini) {
    console.error('Gemini client not initialized');
    return null;
  }

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Simple sketch of ${prompt}, minimalist line drawing style, black and white` }] }],
    });
    
    const response = result.response;
    const text = response.text();
    
    // In reality, Gemini doesn't directly return image URLs
    // This is a simplified example - you'd need to process the response
    // and extract image data, then convert it to a URL or data URI
    
    // For now, we'll just log that we called Gemini and return null
    console.log('Called Gemini API for:', prompt);
    console.log('Response:', text);
    
    // Placeholder - in a real implementation, you would extract the image URL
    // For testing purposes, we'll mock the image URL return
    return null;
  } catch (error: any) {
    console.error('Error generating image with Gemini:', error);
    return null;
  }
};

// Generate image from text prompt with provider fallback
export const generateImage = async (
  options: ImageGenerationOptions
): Promise<string | null> => {
  const provider = options.provider || 'openai';
  const size = options.size || '256x256';
  
  try {
    // Try primary provider
    if (provider === 'openai' && openai) {
      return await generateOpenAIImage(options.prompt, size);
    } else if (provider === 'gemini' && gemini) {
      return await generateGeminiImage(options.prompt);
    }
    
    // Try fallback if primary provider not available
    if (provider === 'openai' && !openai && gemini) {
      console.log('Falling back to Gemini provider');
      return await generateGeminiImage(options.prompt);
    } else if (provider === 'gemini' && !gemini && openai) {
      console.log('Falling back to OpenAI provider');
      return await generateOpenAIImage(options.prompt, size);
    }
    
    console.error('No image generation providers available');
    return null;
  } catch (error: any) {
    console.error('Error generating image:', error);
    
    // Try fallback if primary provider fails
    if (error.message === 'API_QUOTA_EXCEEDED') {
      if (provider === 'openai' && gemini) {
        console.log('Quota exceeded for OpenAI, falling back to Gemini');
        try {
          return await generateGeminiImage(options.prompt);
        } catch (fallbackError) {
          console.error('Fallback to Gemini also failed:', fallbackError);
          throw error; // Re-throw original error if fallback also fails
        }
      } else if (provider === 'gemini' && openai) {
        console.log('Quota exceeded for Gemini, falling back to OpenAI');
        try {
          return await generateOpenAIImage(options.prompt, size);
        } catch (fallbackError) {
          console.error('Fallback to OpenAI also failed:', fallbackError);
          throw error; // Re-throw original error if fallback also fails
        }
      }
    }
    
    throw error;
  }
};

// Download and save image to local file system
export const downloadImage = async (url: string, filename: string): Promise<string | null> => {
  try {
    const downloadDir = `${FileSystem.cacheDirectory}images/`;
    const dirInfo = await FileSystem.getInfoAsync(downloadDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    }
    
    const fileUri = `${downloadDir}${filename}.jpg`;
    
    await FileSystem.downloadAsync(url, fileUri);
    return fileUri;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
};

// Get cached image for a word if exists, otherwise generate new one
export const getImageForWord = async (
  word: string, 
  translation: string,
  apiKey: string,
  provider: ImageProvider = 'openai'
): Promise<string | null> => {
  // Initialize appropriate AI provider if not already
  if (provider === 'openai' && !openai && apiKey) {
    initializeOpenAI(apiKey);
  } else if (provider === 'gemini' && !gemini && apiKey) {
    initializeGemini(apiKey);
  }
  
  const sanitizedWord = word.replace(/[^a-zA-Z0-9]/g, '_');
  const imagePath = `${FileSystem.cacheDirectory}images/${sanitizedWord}.jpg`;
  
  // Check if image already exists
  const fileInfo = await FileSystem.getInfoAsync(imagePath);
  
  if (fileInfo.exists) {
    return imagePath;
  }
  
  // Generate new image
  const imageUrl = await generateImage({
    prompt: translation,
    provider
  });
  
  if (imageUrl) {
    return await downloadImage(imageUrl, sanitizedWord);
  }
  
  return null;
}; 