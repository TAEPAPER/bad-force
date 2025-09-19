import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../utils/constants';

interface AnalysisResultCardProps {
  score: number;
  feedback: string[];
  recommendations: string[];
  details: {
    positionAccuracy: number;
    timing: number;
    stability: number;
  };
}

const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  score,
  feedback,
  recommendations,
  details,
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return COLORS.SUCCESS;
    if (score >= 60) return COLORS.WARNING;
    return COLORS.ERROR;
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🎯';
    if (score >= 70) return '👍';
    if (score >= 60) return '👌';
    return '💪';
  };

  return (
    <ScrollView style={styles.container}>
      {/* 전체 점수 */}
      <View style={styles.scoreSection}>
        <Text style={styles.scoreEmoji}>{getScoreEmoji(score)}</Text>
        <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
          {Math.round(score)}점
        </Text>
        <Text style={styles.scoreLabel}>전체 점수</Text>
      </View>

      {/* 세부 점수 */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>세부 분석</Text>
        <View style={styles.detailRow}>
          <DetailScoreItem
            label="위치 정확도"
            score={details.positionAccuracy}
            icon="🎯"
          />
          <DetailScoreItem
            label="타이밍"
            score={details.timing}
            icon="⏱️"
          />
          <DetailScoreItem
            label="안정성"
            score={details.stability}
            icon="🧘‍♂️"
          />
        </View>
      </View>

      {/* 피드백 */}
      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>피드백</Text>
        {feedback.map((item, index) => (
          <View key={index} style={styles.feedbackItem}>
            <Text style={styles.feedbackText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* 개선 권장사항 */}
      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>개선 권장사항</Text>
        {recommendations.map((item, index) => (
          <View key={index} style={styles.recommendationItem}>
            <View style={styles.recommendationBullet} />
            <Text style={styles.recommendationText}>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

interface DetailScoreItemProps {
  label: string;
  score: number;
  icon: string;
}

const DetailScoreItem: React.FC<DetailScoreItemProps> = ({ label, score, icon }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return COLORS.SUCCESS;
    if (score >= 60) return COLORS.WARNING;
    return COLORS.ERROR;
  };

  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${score}%`,
              backgroundColor: getScoreColor(score)
            }
          ]} 
        />
      </View>
      <Text style={[styles.detailScore, { color: getScoreColor(score) }]}>
        {Math.round(score)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  scoreSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  scoreEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 16,
    color: COLORS.GRAY_MEDIUM,
  },
  detailsSection: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  detailRow: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailIcon: {
    fontSize: 20,
    width: 30,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.BLACK,
    marginRight: 12,
  },
  progressBar: {
    width: 80,
    height: 6,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  detailScore: {
    fontSize: 14,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  feedbackSection: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  feedbackItem: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: COLORS.BLACK,
    lineHeight: 20,
  },
  recommendationsSection: {
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.PRIMARY,
    marginTop: 6,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.BLACK,
    lineHeight: 20,
  },
});

export default AnalysisResultCard;