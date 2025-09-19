/**
 * BadForce - 배드민턴 자세 분석 앱
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

// MediaPipe 웹 기반 포즈 인식 사용

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
