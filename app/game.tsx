import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  Alert,
  BackHandler
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Flashcard from '../components/Flashcard';
import { useGame } from '../context/GameContext';
import { Word } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageProvider } from '../services/imageService';

// Keys for storing API keys (same as in settings.tsx)
const OPENAI_API_KEY_STORAGE = 'openai_api_key';
const GEMINI_API_KEY_STORAGE = 'gemini_api_key';
const IMAGE_PROVIDER_STORAGE = 'image_provider';

export default function GameScreen() {
  const { languageId, levelId } = useLocalSearchParams<{ languageId: string; levelId: string }>();
  const { 
    getLevel, 
    currentLanguage, 
    gameSettings, 
    updateProgress,
    updateSettings,
    isLoading 
  } = useGame();
  
  // Game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(gameSettings.timePerWord);
  const [timerActive, setTimerActive] = useState(true);
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [imageProvider, setImageProvider] = useState<ImageProvider>(gameSettings.imageProvider as ImageProvider || 'openai');
  
  // Animation values
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  // Load level data
  useEffect(() => {
    if (!languageId || !levelId) {
      Alert.alert('Error', 'Invalid language or level ID');
      router.back();
      return;
    }
    
    const level = getLevel(languageId, parseInt(levelId, 10));
    
    if (!level) {
      Alert.alert('Error', 'Level not found');
      router.back();
      return;
    }
    
    // Get API keys and provider from AsyncStorage
    const loadApiKeys = async () => {
      try {
        const storedOpenaiKey = await AsyncStorage.getItem(OPENAI_API_KEY_STORAGE);
        const storedGeminiKey = await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE);
        const storedProvider = await AsyncStorage.getItem(IMAGE_PROVIDER_STORAGE);
        
        if (storedOpenaiKey) {
          console.log('OpenAI API key loaded successfully');
          setOpenaiApiKey(storedOpenaiKey);
        }
        
        if (storedGeminiKey) {
          console.log('Gemini API key loaded successfully');
          setGeminiApiKey(storedGeminiKey);
        }
        
        if (storedProvider) {
          console.log('Image provider set to:', storedProvider);
          setImageProvider(storedProvider as ImageProvider);
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    };
    
    loadApiKeys();
    
    // Shuffle words for the level
    const shuffledWords = [...level.words].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
    
    // Reset game state
    setCurrentWordIndex(0);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setGameCompleted(false);
    setTimeLeft(gameSettings.timePerWord);
    setTimerActive(true);
  }, [languageId, levelId, getLevel, gameSettings.timePerWord]);
  
  // Handle back button
  useEffect(() => {
    const handleBackPress = () => {
      if (gameCompleted) {
        router.back();
        return true;
      }
      
      Alert.alert(
        'Quit Game',
        'Are you sure you want to quit? Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          { text: 'Quit', style: 'destructive', onPress: () => router.back() }
        ]
      );
      return true;
    };
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => backHandler.remove();
  }, [gameCompleted]);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0 && !gameCompleted) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !gameCompleted) {
      // Time's up for this word
      handleIncorrect();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, timerActive, gameCompleted]);
  
  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: currentWordIndex / words.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentWordIndex, words.length, progressAnimation]);
  
  // Handle correct answer
  const handleCorrect = () => {
    setCorrectCount(prev => prev + 1);
    setScore(prev => prev + 20); // 20 points per correct answer
    setTimerActive(false);
  };
  
  // Handle incorrect answer
  const handleIncorrect = () => {
    setIncorrectCount(prev => prev + 1);
    setTimerActive(false);
  };
  
  // Move to next word or complete game
  const handleComplete = () => {
    if (currentWordIndex < words.length - 1) {
      // Move to next word
      setCurrentWordIndex(prev => prev + 1);
      setTimeLeft(gameSettings.timePerWord);
      setTimerActive(true);
    } else {
      // End of game
      const finalScore = Math.round((correctCount + 1) * 100 / words.length);
      setGameCompleted(true);
      
      // Update progress
      if (languageId && levelId) {
        updateProgress(languageId, parseInt(levelId, 10), finalScore);
      }
    }
  };
  
  // Quit game
  const handleQuitGame = () => {
    Alert.alert(
      'Quit Game',
      'Are you sure you want to quit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { text: 'Quit', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };
  
  // Play again
  const handlePlayAgain = () => {
    const level = getLevel(languageId || '', parseInt(levelId || '0', 10));
    
    if (!level) {
      router.back();
      return;
    }
    
    // Shuffle words for the level
    const shuffledWords = [...level.words].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
    
    // Reset game state
    setCurrentWordIndex(0);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setGameCompleted(false);
    setTimeLeft(gameSettings.timePerWord);
    setTimerActive(true);
  };
  
  // Get the current API key based on provider
  const getCurrentApiKey = () => {
    return imageProvider === 'openai' ? openaiApiKey : geminiApiKey;
  };
  
  // If loading or no words, show loading indicator
  if (isLoading || words.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4a69bd" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }
  
  // Calculate progress width
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  // Current word
  const currentWord = words[currentWordIndex];
  
  // Game completed view
  if (gameCompleted) {
    const finalScore = Math.round(correctCount * 100 / words.length);
    const isPassing = finalScore >= 70;
    
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.resultsContainer}>
          <Text style={styles.resultTitle}>
            {isPassing ? 'Great Job!' : 'Nice Try!'}
          </Text>
          
          <View style={styles.scoreCircle}>
            <Text style={styles.finalScoreText}>{finalScore}%</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="close-circle" size={24} color="#e74c3c" />
              <Text style={styles.statValue}>{incorrectCount}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#f39c12" />
              <Text style={styles.statValue}>{words.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
          
          <View style={styles.resultMessage}>
            <Text style={styles.messageText}>
              {isPassing 
                ? 'You\'ve completed this level successfully!' 
                : 'Try again to improve your score.'}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Back to Levels</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]} 
              onPress={handlePlayAgain}
            >
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Game Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleQuitGame}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>
              {currentWordIndex + 1}/{words.length}
            </Text>
          </View>
          
          <View style={styles.scoreHeaderContainer}>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>
        
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: progressWidth }
            ]} 
          />
        </View>
        
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={18} color="#fff" />
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>
      
      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <Flashcard
          word={currentWord}
          otherWords={words.filter(w => w.id !== currentWord.id)}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          onComplete={handleComplete}
          showImage={gameSettings.useImages}
          apiKey={getCurrentApiKey()}
          imageProvider={imageProvider}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4a69bd',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  progressText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scoreHeaderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#4a69bd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  finalScoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  resultMessage: {
    marginBottom: 30,
  },
  messageText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4a69bd',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
  },
  secondaryButtonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 