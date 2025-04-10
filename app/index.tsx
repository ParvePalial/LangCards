import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import LanguageCard from '../components/LanguageCard';
import { useGame } from '../context/GameContext';
import { Language } from '../types';

export default function HomeScreen() {
  const { 
    languages, 
    isLoading, 
    error, 
    setCurrentLanguage,
    userProgress
  } = useGame();

  // Handle language selection
  const handleLanguagePress = (language: Language) => {
    setCurrentLanguage(language);
    router.push('/levels');
  };

  // Navigate to settings
  const navigateToSettings = () => {
    router.push('/settings');
  };

  // Get total score
  const totalScore = userProgress.totalScore;
  const totalCompletedLevels = Object.values(userProgress.languages)
    .reduce((sum, lang) => sum + lang.completedLevels.length, 0);

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4a69bd" />
        <Text style={styles.loadingText}>Loading languages...</Text>
      </View>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Total Score</Text>
          <Text style={styles.scoreValue}>{totalScore}</Text>
        </View>
        
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Levels Completed</Text>
          <Text style={styles.levelValue}>{totalCompletedLevels}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={navigateToSettings}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Language Flashcards</Text>
        <Text style={styles.subtitle}>Choose a language to start learning</Text>
      </View>
      
      {/* Languages Grid */}
      {languages.length > 0 ? (
        <FlatList
          data={languages}
          renderItem={({ item }) => (
            <LanguageCard language={item} onPress={handleLanguagePress} />
          )}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.languageGrid}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.noLanguagesText}>No languages available</Text>
        </View>
      )}
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a69bd',
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a69bd',
  },
  settingsButton: {
    padding: 8,
  },
  titleSection: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  languageGrid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4a69bd',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noLanguagesText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
}); 