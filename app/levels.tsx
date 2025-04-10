import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { Level } from '../types';

export default function LevelsScreen() {
  const { currentLanguage, isLoading } = useGame();

  // Handle level selection
  const handleLevelPress = (level: Level) => {
    if (!currentLanguage) return;
    
    router.push({
      pathname: '/game',
      params: {
        languageId: currentLanguage.id,
        levelId: level.id.toString(),
      }
    });
  };

  // Go back to language selection
  const handleBackPress = () => {
    router.back();
  };

  // If loading or no language selected, show loading indicator
  if (isLoading || !currentLanguage) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4a69bd" />
        <Text style={styles.loadingText}>Loading levels...</Text>
      </View>
    );
  }

  // Get the next unlocked level
  const getNextLevel = () => {
    const uncompletedLevels = currentLanguage.levels.filter(level => !level.completed);
    return uncompletedLevels.length > 0 ? uncompletedLevels[0].id : null;
  };

  const nextLevel = getNextLevel();

  // Render level item
  const renderLevelItem = ({ item }: { item: Level }) => {
    const isCompleted = item.completed;
    const isNextLevel = item.id === nextLevel;
    const isLocked = !isCompleted && !isNextLevel;
    
    return (
      <TouchableOpacity
        style={[
          styles.levelCard,
          isCompleted && styles.completedLevel,
          isNextLevel && styles.nextLevel,
          isLocked && styles.lockedLevel,
        ]}
        onPress={() => handleLevelPress(item)}
        disabled={isLocked}
      >
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>{item.name}</Text>
          {isCompleted && (
            <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
          )}
          {isLocked && (
            <Ionicons name="lock-closed" size={24} color="#95a5a6" />
          )}
          {isNextLevel && !isCompleted && (
            <Ionicons name="play" size={24} color="#f39c12" />
          )}
        </View>
        
        <View style={styles.levelDetails}>
          <Text style={styles.wordCount}>{item.words.length} Words</Text>
          {isCompleted && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>{item.score}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentLanguage.name}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progress, 
                { width: `${currentLanguage.progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(currentLanguage.progress)}% Complete
          </Text>
        </View>
      </View>
      
      {/* Level List */}
      <FlatList
        data={currentLanguage.levels}
        renderItem={renderLevelItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.levelList}
      />
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
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  progressText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  levelList: {
    padding: 16,
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedLevel: {
    borderLeftWidth: 6,
    borderLeftColor: '#2ecc71',
  },
  nextLevel: {
    borderLeftWidth: 6,
    borderLeftColor: '#f39c12',
  },
  lockedLevel: {
    opacity: 0.6,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  levelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wordCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
}); 