import React from 'react';
import { GameProvider } from './context/GameContext';
import { ExpoRoot } from 'expo-router';

// Must be exported as default component
export default function App() {
  // The string import.meta.url needs to be converted to a static string
  // For more details: https://docs.expo.dev/router/reference/exported-files/
  return (
    <GameProvider>
      <ExpoRoot context={require.context('./app')} />
    </GameProvider>
  );
}
