import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import AnalysisScreen from '../screens/analysis/AnalysisScreen';
// Import other screens when they're created
// import CameraScreen from '../screens/camera/CameraScreen';
// import SettingsScreen from '../screens/settings/SettingsScreen';
import type { NavigationStackParamList } from '../types';

const Stack = createStackNavigator<NavigationStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
        {/* Uncomment when screens are implemented
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;