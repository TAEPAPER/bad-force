import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common';
import VideoComparisonView from '../../components/analysis/VideoComparisonView';
import AnalysisResultCard from '../../components/analysis/AnalysisResultCard';
import { usePoseAnalysis } from '../../hooks/usePoseAnalysis';
import { useVideoUpload } from '../../hooks/useVideoUpload';
import { AnalysisResult, ShotType } from '../../types';
import { COLORS } from '../../utils/constants';
import type { NavigationStackParamList } from '../../types';
import type { StackNavigationProp } from '@react-navigation/stack';

type AnalysisScreenNavigationProp = StackNavigationProp<NavigationStackParamList, 'Analysis'>;

interface AnalysisScreenProps {
  navigation: AnalysisScreenNavigationProp;
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'result'>('upload');
  const [referenceVideoInfo, setReferenceVideoInfo] = useState<any>(null);
  const [userVideoInfo, setUserVideoInfo] = useState<any>(null);
  const [selectedShotType, _setSelectedShotType] = useState<ShotType>('smash');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const { analysisState, compareVideos, resetAnalysis } = usePoseAnalysis();
  const { uploadVideo } = useVideoUpload();

  const handleReferenceVideoLoad = async () => {
    try {
      const videoInfo = await uploadVideo('reference');
      if (videoInfo) {
        setReferenceVideoInfo(videoInfo);
        Alert.alert('성공', '기준 영상이 업로드되었습니다.');
      }
    } catch (error) {
      console.error('Reference video upload failed:', error);
    }
  };

  const handleUserVideoLoad = async () => {
    try {
      const videoInfo = await uploadVideo('user');
      if (videoInfo) {
        setUserVideoInfo(videoInfo);
        Alert.alert('성공', '사용자 영상이 업로드되었습니다.');
      }
    } catch (error) {
      console.error('User video upload failed:', error);
    }
  };

  const handleStartComparison = async () => {
    if (!referenceVideoInfo || !userVideoInfo) {
      Alert.alert('오류', '기준 영상과 사용자 영상을 모두 업로드해주세요.');
      return;
    }

    try {
      console.log('Starting video comparison analysis...');
      console.log('Reference video:', referenceVideoInfo);
      console.log('User video:', userVideoInfo);

      // 실제 영상 분석 실행
      const result = await compareVideos(
        {
          uri: referenceVideoInfo.uri,
          duration: referenceVideoInfo.duration || 3
        },
        {
          uri: userVideoInfo.uri,
          duration: userVideoInfo.duration || 3
        },
        selectedShotType
      );
      
      setAnalysisResult(result);
      setCurrentStep('result');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('오류', '분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
    setAnalysisResult(null);
    resetAnalysis();
  };

  const handleBackPress = () => {
    if (currentStep === 'result') {
      handleBackToUpload();
    } else {
      navigation.goBack();
    }
  };

  const mockDetails = {
    positionAccuracy: 82,
    timing: 68,
    stability: 75
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="자세 분석"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <View style={styles.content}>
        {currentStep === 'upload' ? (
          <VideoComparisonView
            referenceVideoUri={referenceVideoInfo?.uri || null}
            userVideoUri={userVideoInfo?.uri || null}
            onReferenceVideoLoad={handleReferenceVideoLoad}
            onUserVideoLoad={handleUserVideoLoad}
            onStartComparison={handleStartComparison}
            isAnalyzing={analysisState.isAnalyzing}
            analysisProgress={analysisState.progress}
          />
        ) : (
          analysisResult && (
            <AnalysisResultCard
              score={analysisResult.score}
              feedback={analysisResult.feedback}
              recommendations={analysisResult.recommendations}
              details={mockDetails}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  content: {
    flex: 1,
  },
});

export default AnalysisScreen;