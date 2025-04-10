import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageProvider } from '../services/imageService';

// Keys for storing API keys
const OPENAI_API_KEY_STORAGE = 'openai_api_key';
const GEMINI_API_KEY_STORAGE = 'gemini_api_key';
const IMAGE_PROVIDER_STORAGE = 'image_provider';

export default function SettingsScreen() {
  const { gameSettings, updateSettings, resetProgress } = useGame();
  
  // Local state
  const [wordsPerLevel, setWordsPerLevel] = useState(gameSettings.wordsPerLevel);
  const [timePerWord, setTimePerWord] = useState(gameSettings.timePerWord);
  const [useImages, setUseImages] = useState(gameSettings.useImages);
  const [soundEnabled, setSoundEnabled] = useState(gameSettings.soundEnabled);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [imageProvider, setImageProvider] = useState<ImageProvider>('openai');
  
  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedOpenaiKey = await AsyncStorage.getItem(OPENAI_API_KEY_STORAGE);
        const storedGeminiKey = await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE);
        const storedProvider = await AsyncStorage.getItem(IMAGE_PROVIDER_STORAGE);
        
        if (storedOpenaiKey) {
          setOpenaiApiKey(storedOpenaiKey);
        }
        
        if (storedGeminiKey) {
          setGeminiApiKey(storedGeminiKey);
        }
        
        if (storedProvider) {
          setImageProvider(storedProvider as ImageProvider);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Handle save settings
  const handleSaveSettings = async () => {
    // Update game settings
    updateSettings({
      wordsPerLevel,
      timePerWord,
      useImages,
      soundEnabled,
      imageProvider,
      apiKey: imageProvider === 'openai' ? openaiApiKey : geminiApiKey
    });
    
    // Save API Keys to secure storage
    try {
      if (openaiApiKey) {
        await AsyncStorage.setItem(OPENAI_API_KEY_STORAGE, openaiApiKey);
      }
      
      if (geminiApiKey) {
        await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE, geminiApiKey);
      }
      
      await AsyncStorage.setItem(IMAGE_PROVIDER_STORAGE, imageProvider);
      
      Alert.alert(
        'Settings Saved',
        'Your settings have been saved successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert(
        'Error',
        'There was an error saving your settings.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle selecting image provider
  const selectImageProvider = (provider: ImageProvider) => {
    setImageProvider(provider);
  };
  
  // Handle reset progress
  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: () => {
            resetProgress();
            Alert.alert(
              'Progress Reset',
              'Your progress has been reset successfully.',
              [{ text: 'OK' }]
            );
          } 
        }
      ]
    );
  };
  
  // Go back
  const handleBackPress = () => {
    router.back();
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Game Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Settings</Text>
          
          {/* Words Per Level */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Words Per Level</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={wordsPerLevel}
                onValueChange={setWordsPerLevel}
                minimumTrackTintColor="#4a69bd"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#4a69bd"
              />
              <Text style={styles.sliderValue}>{wordsPerLevel}</Text>
            </View>
          </View>
          
          {/* Time Per Word */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Time Per Word (seconds)</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={60}
                step={5}
                value={timePerWord}
                onValueChange={setTimePerWord}
                minimumTrackTintColor="#4a69bd"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#4a69bd"
              />
              <Text style={styles.sliderValue}>{timePerWord}</Text>
            </View>
          </View>
          
          {/* Use Images */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Show Images</Text>
            <Switch
              value={useImages}
              onValueChange={setUseImages}
              trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
              thumbColor={useImages ? '#4a69bd' : '#f4f3f4'}
              ios_backgroundColor="#d3d3d3"
            />
          </View>
          
          {/* Sound Enabled */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
              thumbColor={soundEnabled ? '#4a69bd' : '#f4f3f4'}
              ios_backgroundColor="#d3d3d3"
            />
          </View>
        </View>
        
        {/* AI Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Image Generation</Text>
          
          {/* Image Provider Selection */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Image Provider</Text>
            <View style={styles.providerOptions}>
              <TouchableOpacity 
                style={[
                  styles.providerOption, 
                  imageProvider === 'openai' && styles.selectedProviderOption
                ]}
                onPress={() => selectImageProvider('openai')}
              >
                <Text style={[
                  styles.providerOptionText,
                  imageProvider === 'openai' && styles.selectedProviderOptionText
                ]}>OpenAI</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.providerOption, 
                  imageProvider === 'gemini' && styles.selectedProviderOption
                ]}
                onPress={() => selectImageProvider('gemini')}
              >
                <Text style={[
                  styles.providerOptionText,
                  imageProvider === 'gemini' && styles.selectedProviderOptionText
                ]}>Gemini</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* OpenAI API Key */}
          {imageProvider === 'openai' && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>OpenAI API Key</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your OpenAI API key"
                value={openaiApiKey}
                onChangeText={setOpenaiApiKey}
                secureTextEntry={true}
                autoCapitalize="none"
              />
              <Text style={styles.apiKeyNote}>
                Required for OpenAI image generation. Your key will be stored securely on your device.
              </Text>
            </View>
          )}
          
          {/* Gemini API Key */}
          {imageProvider === 'gemini' && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Gemini API Key</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your Gemini API key"
                value={geminiApiKey}
                onChangeText={setGeminiApiKey}
                secureTextEntry={true}
                autoCapitalize="none"
              />
              <Text style={styles.apiKeyNote}>
                Required for Gemini image generation. Your key will be stored securely on your device.
              </Text>
            </View>
          )}
        </View>
        
        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          {/* Reset Progress */}
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetProgress}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.resetButtonText}>Reset All Progress</Text>
          </TouchableOpacity>
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <Text style={styles.aboutText}>
            Language Flashcards v1.0.0
          </Text>
          <Text style={styles.aboutText}>
            Created with React Native and Expo
          </Text>
        </View>
      </ScrollView>
      
      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a69bd',
    width: 30,
    textAlign: 'center',
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  apiKeyNote: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
  },
  saveButton: {
    backgroundColor: '#4a69bd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  providerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  providerOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 120,
    alignItems: 'center',
  },
  selectedProviderOption: {
    backgroundColor: '#4a69bd',
    borderColor: '#4a69bd',
  },
  providerOptionText: {
    color: '#333',
  },
  selectedProviderOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 