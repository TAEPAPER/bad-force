import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Header } from '../../components/common';
import type { NavigationStackParamList } from '../../types';
import type { StackNavigationProp } from '@react-navigation/stack';

type HomeScreenNavigationProp = StackNavigationProp<NavigationStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleStartAnalysis = () => {
    navigation.navigate('Camera');
  };

  const handleViewPreviousAnalysis = () => {
    navigation.navigate('Analysis', {});
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="BadForce" />
      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>배드민턴 자세 분석</Text>
          <Text style={styles.welcomeSubtitle}>
            AI가 당신의 자세를 분석하고 개선점을 제안합니다
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="자세 분석 시작"
            onPress={handleStartAnalysis}
            variant="primary"
            style={styles.button}
          />
          <Button
            title="이전 분석 보기"
            onPress={handleViewPreviousAnalysis}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="설정"
            onPress={handleSettings}
            variant="secondary"
            style={styles.button}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>분석 가능한 샷</Text>
          <View style={styles.shotTypes}>
            <Text style={styles.shotType}>• 스매시</Text>
            <Text style={styles.shotType}>• 서브</Text>
            <Text style={styles.shotType}>• 클리어</Text>
            <Text style={styles.shotType}>• 드롭샷</Text>
            <Text style={styles.shotType}>• 네트샷</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonSection: {
    marginVertical: 20,
  },
  button: {
    marginBottom: 16,
  },
  infoSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  shotTypes: {
    gap: 8,
  },
  shotType: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default HomeScreen;