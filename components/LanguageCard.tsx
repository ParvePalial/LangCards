import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Language } from '../types';

interface LanguageCardProps {
  language: Language;
  onPress: (language: Language) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.43;

const LanguageCard: React.FC<LanguageCardProps> = ({ language, onPress }) => {
  // Function to get a color based on language id
  const getLanguageColor = (id: string): string => {
    const colors = {
      spanish: '#ff9f43',
      french: '#54a0ff',
      german: '#10ac84',
      japanese: '#ee5253',
      korean: '#5f27cd',
      arabic: '#ff6b6b',
      russian: '#1dd1a1',
      sanskrit: '#8854d0',
    };
    
    return (colors as any)[id] || '#4a69bd';
  };
  
  // Get level progress
  const completedLevels = language.levels.filter(level => level.completed).length;
  const totalLevels = language.levels.length;
  
  // Calculate progress percentage
  const progressPercentage = totalLevels > 0 
    ? (completedLevels / totalLevels) * 100 
    : 0;
  
  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: getLanguageColor(language.id) }]} 
      onPress={() => onPress(language)}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.progressBar, 
          { 
            backgroundColor: getLanguageColor(language.id),
            width: `${progressPercentage}%`,
          }
        ]} 
      />
      
      <Text style={styles.title}>{language.name}</Text>
      
      <Text style={styles.stats}>
        {completedLevels}/{totalLevels} Levels
      </Text>
      
      <Text style={styles.words}>
        {language.words.length} Words
      </Text>
      
      <View style={styles.iconContainer}>
        <AntDesign 
          name="arrowright" 
          size={20} 
          color={getLanguageColor(language.id)} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 6,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stats: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  words: {
    fontSize: 12,
    color: '#888',
  },
  iconContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default LanguageCard; 