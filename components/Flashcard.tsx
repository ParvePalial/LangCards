import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView
} from 'react-native';
import { FlashcardState, Word } from '../types';
import { getImageForWord, ImageProvider } from '../services/imageService';

interface FlashcardProps {
  word: Word;
  otherWords: Word[]; // Add this prop for generating incorrect answers
  onCorrect: () => void;
  onIncorrect: () => void;
  onComplete: () => void;
  showImage: boolean;
  apiKey?: string;
  imageProvider?: ImageProvider;
}

interface Option {
  text: string;
  isCorrect: boolean;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.5;

const Flashcard: React.FC<FlashcardProps> = ({ 
  word, 
  otherWords = [],
  onCorrect, 
  onIncorrect, 
  onComplete,
  showImage = true,
  apiKey,
  imageProvider = 'openai'
}) => {
  const [cardState, setCardState] = useState<FlashcardState>('front');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [apiQuotaExceeded, setApiQuotaExceeded] = useState<boolean>(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Animation values
  const cardOpacity = new Animated.Value(1);

  // Generate multiple choice options
  useEffect(() => {
    if (!word || otherWords.length < 3) return;
    
    // Get 3 random words from otherWords
    const shuffledWords = [...otherWords]
      .filter(w => w.translation !== word.translation) // Ensure no duplicates with correct answer
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // Create options with the correct answer and 3 incorrect ones
    const allOptions: Option[] = [
      { text: word.translation, isCorrect: true },
      ...shuffledWords.map(w => ({ text: w.translation, isCorrect: false }))
    ];
    
    // Shuffle the options
    setOptions(allOptions.sort(() => 0.5 - Math.random()));
    
    // Reset state for new word
    setSelectedOption(null);
    setShowFeedback(false);
  }, [word, otherWords]);

  // Load image when component mounts or word changes
  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      if (showImage && apiKey && word.translation) {
        setLoadingImage(true);
        setApiQuotaExceeded(false);
        try {
          const uri = await getImageForWord(word.original, word.translation, apiKey, imageProvider);
          if (isMounted) {
            setImageUri(uri);
          }
        } catch (error: any) {
          console.error('Error loading image:', error);
          if (error.message === 'API_QUOTA_EXCEEDED' && isMounted) {
            setApiQuotaExceeded(true);
          }
        } finally {
          if (isMounted) {
            setLoadingImage(false);
          }
        }
      }
    };
    
    // Reset card state when word changes
    setCardState('front');
    cardOpacity.setValue(1);
    setImageUri(null);
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [word, showImage, apiKey, imageProvider]);

  // Handle option selection
  const handleOptionSelect = (index: number) => {
    if (showFeedback) return; // Prevent selecting another option after feedback is shown
    
    setSelectedOption(index);
    setShowFeedback(true);
    
    // Check if selected option is correct
    if (options[index].isCorrect) {
      setCardState('correct');
      // Animate card opacity for correct answer
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onCorrect();
        onComplete();
      });
    } else {
      setCardState('incorrect');
      // Shake animation for incorrect answer
      Animated.sequence([
        Animated.timing(cardOpacity, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onIncorrect();
        // We don't complete here to let the user see the correct answer
      });
    }
  };

  // Handle continue after incorrect answer
  const handleContinue = () => {
    onComplete();
  };

  // Render option button
  const renderOption = (option: Option, index: number) => {
    const isSelected = selectedOption === index;
    const showCorrectHighlight = showFeedback && option.isCorrect;
    const showIncorrectHighlight = showFeedback && isSelected && !option.isCorrect;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.optionButton,
          isSelected && styles.selectedOption,
          showCorrectHighlight && styles.correctOption,
          showIncorrectHighlight && styles.incorrectOption,
        ]}
        onPress={() => handleOptionSelect(index)}
        disabled={showFeedback}
      >
        <Text style={[
          styles.optionText,
          showCorrectHighlight && styles.correctOptionText,
          showIncorrectHighlight && styles.incorrectOptionText,
        ]}>
          {option.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: cardOpacity }]}>
      <View style={styles.card}>
        {/* Word to translate */}
        <Text style={styles.wordText}>{word.original}</Text>
        
        {/* Image section */}
        {showImage && (
          <View style={styles.imageContainer}>
            {loadingImage ? (
              <ActivityIndicator size="large" color="#4a69bd" />
            ) : imageUri ? (
              <Image 
                source={{ uri: imageUri }} 
                style={styles.image} 
                resizeMode="contain"
              />
            ) : apiQuotaExceeded ? (
              <Text style={styles.errorText}>API quota exceeded. Please check your API key or try a different provider.</Text>
            ) : (
              <Text style={styles.noImageText}>No image available</Text>
            )}
          </View>
        )}
        
        {/* Question prompt */}
        <Text style={styles.promptText}>What does this word mean?</Text>
        
        {/* Multiple choice options */}
        <ScrollView contentContainerStyle={styles.optionsContainer}>
          {options.map((option, index) => renderOption(option, index))}
        </ScrollView>
        
        {/* Continue button (shown after incorrect answer) */}
        {showFeedback && !options[selectedOption || 0]?.isCorrect && (
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: CARD_WIDTH,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4a69bd',
    marginBottom: 20,
  },
  promptText: {
    fontSize: 18,
    color: '#2c3e50',
    marginVertical: 15,
    textAlign: 'center',
  },
  imageContainer: {
    width: CARD_WIDTH - 60,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  noImageText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  optionsContainer: {
    width: '100%',
    marginVertical: 10,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#dfe4ea',
  },
  selectedOption: {
    borderColor: '#4a69bd',
    borderWidth: 2,
  },
  correctOption: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  incorrectOption: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  correctOptionText: {
    color: '#155724',
    fontWeight: 'bold',
  },
  incorrectOptionText: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: '#4a69bd',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Flashcard; 