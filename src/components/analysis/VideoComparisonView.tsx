import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../../utils/constants';

interface VideoComparisonViewProps {
  referenceVideoUri: string | null;
  userVideoUri: string | null;
  onReferenceVideoLoad?: () => void;
  onUserVideoLoad?: () => void;
  onStartComparison?: () => void;
  isAnalyzing?: boolean;
  analysisProgress?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const videoWidth = (screenWidth - 48) / 2; // 좌우 패딩 16 + 가운데 간격 16

const VideoComparisonView: React.FC<VideoComparisonViewProps> = ({
  referenceVideoUri,
  userVideoUri,
  onReferenceVideoLoad,
  onUserVideoLoad,
  onStartComparison,
  isAnalyzing = false,
  analysisProgress = 0,
}) => {
  const [selectedVideo, _setSelectedVideo] = useState<'reference' | 'user' | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>영상 비교 분석</Text>
      
      {/* 영상 업로드 섹션 */}
      <View style={styles.videoSection}>
        <View style={styles.videoRow}>
          {/* 기준 영상 */}
          <View style={styles.videoContainer}>
            <Text style={styles.videoLabel}>기준 영상</Text>
            <TouchableOpacity
              style={[
                styles.videoPlaceholder,
                referenceVideoUri && styles.videoLoaded,
                selectedVideo === 'reference' && styles.videoSelected
              ]}
              onPress={onReferenceVideoLoad}
              disabled={isAnalyzing}
            >
              {referenceVideoUri ? (
                <View style={styles.videoPreview}>
                  <Text style={styles.videoLoadedText}>✓ 영상 로드됨</Text>
                </View>
              ) : (
                <View style={styles.uploadPrompt}>
                  <Text style={styles.uploadIcon}>📹</Text>
                  <Text style={styles.uploadText}>기준 영상{'\n'}업로드</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 사용자 영상 */}
          <View style={styles.videoContainer}>
            <Text style={styles.videoLabel}>내 영상</Text>
            <TouchableOpacity
              style={[
                styles.videoPlaceholder,
                userVideoUri && styles.videoLoaded,
                selectedVideo === 'user' && styles.videoSelected
              ]}
              onPress={onUserVideoLoad}
              disabled={isAnalyzing}
            >
              {userVideoUri ? (
                <View style={styles.videoPreview}>
                  <Text style={styles.videoLoadedText}>✓ 영상 로드됨</Text>
                </View>
              ) : (
                <View style={styles.uploadPrompt}>
                  <Text style={styles.uploadIcon}>🎥</Text>
                  <Text style={styles.uploadText}>내 영상{'\n'}업로드</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 분석 진행 상태 */}
      {isAnalyzing && (
        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>분석 진행 중...</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${analysisProgress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(analysisProgress)}%</Text>
          </View>
        </View>
      )}

      {/* 분석 시작 버튼 */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (!referenceVideoUri || !userVideoUri || isAnalyzing) && styles.analyzeButtonDisabled
          ]}
          onPress={onStartComparison}
          disabled={!referenceVideoUri || !userVideoUri || isAnalyzing}
        >
          <Text style={[
            styles.analyzeButtonText,
            (!referenceVideoUri || !userVideoUri || isAnalyzing) && styles.analyzeButtonTextDisabled
          ]}>
            {isAnalyzing ? '분석 중...' : '자세 비교 분석 시작'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 사용 가이드 */}
      <View style={styles.guideSection}>
        <Text style={styles.guideTitle}>📋 사용 가이드</Text>
        <View style={styles.guideItem}>
          <Text style={styles.guideBullet}>1.</Text>
          <Text style={styles.guideText}>먼저 분석하고 싶은 기준 영상을 업로드하세요</Text>
        </View>
        <View style={styles.guideItem}>
          <Text style={styles.guideBullet}>2.</Text>
          <Text style={styles.guideText}>본인의 자세 영상을 업로드하세요</Text>
        </View>
        <View style={styles.guideItem}>
          <Text style={styles.guideBullet}>3.</Text>
          <Text style={styles.guideText}>'자세 비교 분석 시작' 버튼을 눌러 분석을 시작하세요</Text>
        </View>
        <View style={styles.guideItem}>
          <Text style={styles.guideBullet}>💡</Text>
          <Text style={styles.guideText}>더 정확한 분석을 위해 정면에서 촬영된 영상을 사용하세요</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: 24,
  },
  videoSection: {
    marginBottom: 24,
  },
  videoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  videoContainer: {
    flex: 1,
  },
  videoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: 12,
  },
  videoPlaceholder: {
    width: videoWidth,
    height: videoWidth * 0.75, // 4:3 비율
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  videoLoaded: {
    borderColor: COLORS.SUCCESS,
    borderStyle: 'solid',
    backgroundColor: COLORS.SUCCESS + '20',
  },
  videoSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + '10',
  },
  videoPreview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadedText: {
    fontSize: 16,
    color: COLORS.SUCCESS,
    fontWeight: '600',
  },
  uploadPrompt: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
    textAlign: 'center',
    lineHeight: 20,
  },
  analysisSection: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    minWidth: 40,
    textAlign: 'right',
  },
  buttonSection: {
    marginBottom: 24,
  },
  analyzeButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  analyzeButtonTextDisabled: {
    color: COLORS.GRAY_MEDIUM,
  },
  guideSection: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    padding: 16,
    borderRadius: 12,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  guideBullet: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    width: 20,
    marginRight: 8,
  },
  guideText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    lineHeight: 20,
  },
});

export default VideoComparisonView;