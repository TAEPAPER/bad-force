import { PoseData, PoseKeypoint, ShotType } from '../../types';

interface ComparisonResult {
  overallScore: number;
  keyPointScores: { [keyPoint: string]: number };
  feedback: string[];
  recommendations: string[];
  details: {
    positionAccuracy: number;
    timing: number;
    stability: number;
  };
}

class PoseComparisonService {
  private readonly IMPORTANT_KEYPOINTS = {
    smash: [
      'left_shoulder', 'right_shoulder',
      'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist',
      'left_hip', 'right_hip',
      'left_knee', 'right_knee'
    ],
    serve: [
      'left_shoulder', 'right_shoulder',
      'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist',
      'left_hip', 'right_hip'
    ],
    clear: [
      'left_shoulder', 'right_shoulder',
      'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist'
    ]
  };

  public comparePoses(
    referencePose: PoseData[],
    userPose: PoseData[],
    shotType: ShotType = 'smash'
  ): ComparisonResult {
    if (!referencePose.length || !userPose.length) {
      throw new Error('Invalid pose data for comparison');
    }

    // 1. 시간 정규화 - 두 영상의 길이를 맞춤
    const normalizedReference = this.normalizeTimeline(referencePose);
    const normalizedUser = this.normalizeTimeline(userPose);

    // 2. 중요 키포인트 추출
    const importantKeypoints = this.IMPORTANT_KEYPOINTS[shotType as keyof typeof this.IMPORTANT_KEYPOINTS] || this.IMPORTANT_KEYPOINTS.smash;

    // 3. 각 프레임별 비교
    const frameScores: number[] = [];
    const keyPointScores: { [keyPoint: string]: number[] } = {};

    const minLength = Math.min(normalizedReference.length, normalizedUser.length);
    
    for (let i = 0; i < minLength; i++) {
      const refFrame = normalizedReference[i];
      const userFrame = normalizedUser[i];
      
      const frameScore = this.compareFrames(refFrame, userFrame, importantKeypoints);
      frameScores.push(frameScore.overallScore);
      
      // 키포인트별 점수 누적
      Object.entries(frameScore.keyPointScores).forEach(([keyPoint, score]) => {
        if (!keyPointScores[keyPoint]) {
          keyPointScores[keyPoint] = [];
        }
        keyPointScores[keyPoint].push(score);
      });
    }

    // 4. 전체 점수 계산
    const overallScore = this.calculateOverallScore(frameScores);
    
    // 5. 키포인트별 평균 점수
    const avgKeyPointScores: { [keyPoint: string]: number } = {};
    Object.entries(keyPointScores).forEach(([keyPoint, scores]) => {
      avgKeyPointScores[keyPoint] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    // 6. 세부 분석
    const details = this.analyzeDetails(normalizedReference, normalizedUser, shotType);

    // 7. 피드백 생성
    const feedback = this.generateFeedback(avgKeyPointScores, details, shotType);
    const recommendations = this.generateRecommendations(avgKeyPointScores, details, shotType);

    return {
      overallScore,
      keyPointScores: avgKeyPointScores,
      feedback,
      recommendations,
      details
    };
  }

  private normalizeTimeline(poseData: PoseData[]): PoseData[] {
    // 영상 길이를 표준화 (예: 60프레임으로 고정)
    const targetFrames = 60;
    const sourceFrames = poseData.length;
    
    if (sourceFrames <= targetFrames) {
      return poseData;
    }

    const normalized: PoseData[] = [];
    const step = sourceFrames / targetFrames;
    
    for (let i = 0; i < targetFrames; i++) {
      const sourceIndex = Math.floor(i * step);
      normalized.push(poseData[sourceIndex]);
    }
    
    return normalized;
  }

  private compareFrames(
    refFrame: PoseData,
    userFrame: PoseData,
    importantKeypoints: string[]
  ): { overallScore: number; keyPointScores: { [keyPoint: string]: number } } {
    const keyPointScores: { [keyPoint: string]: number } = {};
    let totalScore = 0;
    let validKeypoints = 0;

    importantKeypoints.forEach((keypointName, index) => {
      if (index < refFrame.keypoints.length && index < userFrame.keypoints.length) {
        const refKeypoint = refFrame.keypoints[index];
        const userKeypoint = userFrame.keypoints[index];
        
        // 두 키포인트가 모두 신뢰도가 충분한 경우만 비교
        if (refKeypoint.confidence > 0.3 && userKeypoint.confidence > 0.3) {
          const distance = this.calculateKeypointDistance(refKeypoint, userKeypoint);
          const score = Math.max(0, 100 - distance * 100); // 거리를 점수로 변환
          
          keyPointScores[keypointName] = score;
          totalScore += score;
          validKeypoints++;
        }
      }
    });

    const overallScore = validKeypoints > 0 ? totalScore / validKeypoints : 0;
    
    return { overallScore, keyPointScores };
  }

  private calculateKeypointDistance(kp1: PoseKeypoint, kp2: PoseKeypoint): number {
    const dx = kp1.x - kp2.x;
    const dy = kp1.y - kp2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateOverallScore(frameScores: number[]): number {
    if (frameScores.length === 0) return 0;
    
    // 가중 평균: 중간 구간(임팩트 순간)에 더 높은 가중치
    const weights: number[] = [];
    const midPoint = frameScores.length / 2;
    
    frameScores.forEach((_, index) => {
      const distFromMid = Math.abs(index - midPoint) / midPoint;
      const weight = 1 - distFromMid * 0.5; // 중간이 1, 양 끝이 0.5
      weights.push(weight);
    });
    
    const weightedSum = frameScores.reduce((sum, score, index) => {
      return sum + score * weights[index];
    }, 0);
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private analyzeDetails(
    reference: PoseData[],
    user: PoseData[],
    _shotType: ShotType
  ): { positionAccuracy: number; timing: number; stability: number } {
    // 위치 정확도 - 키포인트 위치의 정확성
    const positionAccuracy = this.calculatePositionAccuracy(reference, user);
    
    // 타이밍 - 동작의 시간적 일치도
    const timing = this.calculateTiming(reference, user);
    
    // 안정성 - 동작의 일관성과 떨림 정도
    const stability = this.calculateStability(user);
    
    return { positionAccuracy, timing, stability };
  }

  private calculatePositionAccuracy(reference: PoseData[], user: PoseData[]): number {
    // 전체 프레임에서 위치 정확도 평균 계산
    let totalAccuracy = 0;
    const minLength = Math.min(reference.length, user.length);
    
    for (let i = 0; i < minLength; i++) {
      const frameAccuracy = this.compareFrames(
        reference[i], 
        user[i], 
        this.IMPORTANT_KEYPOINTS.smash
      ).overallScore;
      totalAccuracy += frameAccuracy;
    }
    
    return minLength > 0 ? totalAccuracy / minLength : 0;
  }

  private calculateTiming(reference: PoseData[], user: PoseData[]): number {
    // DTW (Dynamic Time Warping) 알고리즘의 간단한 버전
    // 실제로는 더 복잡한 구현이 필요하지만, 기본적인 형태로 구현
    
    const refLength = reference.length;
    const userLength = user.length;
    
    // 길이 차이를 기반으로 타이밍 점수 계산
    const lengthRatio = Math.min(refLength, userLength) / Math.max(refLength, userLength);
    
    return lengthRatio * 100;
  }

  private calculateStability(user: PoseData[]): number {
    if (user.length < 3) return 100;
    
    let totalVariation = 0;
    let comparisons = 0;
    
    // 연속된 프레임 간의 변화량 계산
    for (let i = 1; i < user.length - 1; i++) {
      const prev = user[i - 1];
      const curr = user[i];
      const next = user[i + 1];
      
      // 이전-현재-다음 프레임의 일관성 확인
      const variation = this.calculateFrameVariation(prev, curr, next);
      totalVariation += variation;
      comparisons++;
    }
    
    const avgVariation = comparisons > 0 ? totalVariation / comparisons : 0;
    
    // 변화량이 적을수록 안정성이 높음
    return Math.max(0, 100 - avgVariation * 50);
  }

  private calculateFrameVariation(prev: PoseData, curr: PoseData, next: PoseData): number {
    let totalVariation = 0;
    let validKeypoints = 0;
    
    for (let i = 0; i < Math.min(prev.keypoints.length, curr.keypoints.length, next.keypoints.length); i++) {
      const prevKp = prev.keypoints[i];
      const currKp = curr.keypoints[i];
      const nextKp = next.keypoints[i];
      
      if (prevKp.confidence > 0.3 && currKp.confidence > 0.3 && nextKp.confidence > 0.3) {
        // 속도와 가속도 기반 변화량 계산
        const velocity1 = this.calculateKeypointDistance(prevKp, currKp);
        const velocity2 = this.calculateKeypointDistance(currKp, nextKp);
        const acceleration = Math.abs(velocity2 - velocity1);
        
        totalVariation += acceleration;
        validKeypoints++;
      }
    }
    
    return validKeypoints > 0 ? totalVariation / validKeypoints : 0;
  }

  private generateFeedback(
    keyPointScores: { [keyPoint: string]: number },
    details: { positionAccuracy: number; timing: number; stability: number },
    _shotType: ShotType
  ): string[] {
    const feedback: string[] = [];
    
    // 전체적인 피드백
    if (details.positionAccuracy >= 80) {
      feedback.push('🎯 훌륭합니다! 자세가 매우 정확합니다.');
    } else if (details.positionAccuracy >= 60) {
      feedback.push('👍 좋은 자세입니다. 조금만 더 정확하게!');
    } else {
      feedback.push('💪 자세 연습이 더 필요합니다.');
    }
    
    // 타이밍 피드백
    if (details.timing < 70) {
      feedback.push('⏱️ 동작의 타이밍을 개선해보세요.');
    }
    
    // 안정성 피드백
    if (details.stability < 70) {
      feedback.push('🧘‍♂️ 동작을 더 안정적으로 수행해보세요.');
    }
    
    // 키포인트별 상세 피드백
    Object.entries(keyPointScores).forEach(([keyPoint, score]) => {
      if (score < 60) {
        const bodyPart = this.getBodyPartKorean(keyPoint);
        feedback.push(`${bodyPart} 위치를 확인해보세요.`);
      }
    });
    
    return feedback;
  }

  private generateRecommendations(
    keyPointScores: { [keyPoint: string]: number },
    details: { positionAccuracy: number; timing: number; stability: number },
    shotType: ShotType
  ): string[] {
    const recommendations: string[] = [];
    
    // 샷 타입별 권장사항
    switch (shotType) {
      case 'smash':
        if (keyPointScores.right_shoulder && keyPointScores.right_shoulder < 70) {
          recommendations.push('어깨를 더 높이 올려보세요.');
        }
        if (keyPointScores.right_elbow && keyPointScores.right_elbow < 70) {
          recommendations.push('팔꿈치 각도를 조정해보세요.');
        }
        break;
      case 'serve':
        recommendations.push('서브 시 무게중심을 앞으로 이동하세요.');
        break;
      case 'clear':
        recommendations.push('클리어 시 라켓을 완전히 뒤로 빼세요.');
        break;
    }
    
    // 일반적인 권장사항
    if (details.stability < 70) {
      recommendations.push('천천히 동작을 연습하여 안정성을 높이세요.');
    }
    
    if (details.timing < 70) {
      recommendations.push('기준 영상을 반복 시청하여 타이밍을 익히세요.');
    }
    
    return recommendations;
  }

  private getBodyPartKorean(keyPoint: string): string {
    const translations: { [key: string]: string } = {
      'left_shoulder': '왼쪽 어깨',
      'right_shoulder': '오른쪽 어깨',
      'left_elbow': '왼쪽 팔꿈치',
      'right_elbow': '오른쪽 팔꿈치',
      'left_wrist': '왼쪽 손목',
      'right_wrist': '오른쪽 손목',
      'left_hip': '왼쪽 엉덩이',
      'right_hip': '오른쪽 엉덩이',
      'left_knee': '왼쪽 무릎',
      'right_knee': '오른쪽 무릎'
    };
    
    return translations[keyPoint] || keyPoint;
  }
}

export default PoseComparisonService;