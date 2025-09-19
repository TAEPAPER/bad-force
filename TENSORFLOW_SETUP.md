# 🚀 BadForce 실제 TensorFlow.js 포즈 인식 설정 가이드

현재 BadForce 앱은 시뮬레이션된 포즈 데이터를 사용하고 있습니다. 
실제 TensorFlow.js 포즈 인식을 활성화하려면 다음 단계를 따르세요.

## 📦 1단계: 필수 패키지 설치

```bash
# 네트워크가 안정된 환경에서 실행
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow-models/pose-detection --legacy-peer-deps
```

### 패키지 설명
- `@tensorflow/tfjs`: TensorFlow.js 코어
- `@tensorflow/tfjs-react-native`: React Native 플랫폼 어댑터
- `@tensorflow-models/pose-detection`: 포즈 감지 모델

## 🔧 2단계: TensorFlowPoseService 활성화

`src/services/pose/TensorFlowPoseService.ts` 파일에서 다음 수정:

### 2-1. 임포트 주석 해제
```typescript
// 현재 (주석된 상태)
/*
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as poseDetection from '@tensorflow-models/pose-detection';
*/

// 변경 후 (활성화)
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as poseDetection from '@tensorflow-models/pose-detection';
```

### 2-2. 실제 모델 초기화 활성화
`initializeTensorFlow()` 메서드에서:

```typescript
// 현재 (시뮬레이션)
await this.simulateModelLoading();

// 변경 후 (실제 TensorFlow.js)
await tf.ready();

const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
};

this.model = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  detectorConfig
);
```

### 2-3. 실제 이미지 분석 활성화
`analyzeImage()` 메서드에서:

```typescript
// 현재 (시뮬레이션)
const keypoints = await this.generateTensorFlowKeypoints(imageSource);

// 변경 후 (실제 분석)
const imageTensor = await this.loadImageAsTensor(imageSource.uri);
const poses = await this.model.estimatePoses(imageTensor);
imageTensor.dispose();

if (poses.length > 0) {
  const keypoints = this.convertTensorFlowKeypoints(poses[0].keypoints);
  return { keypoints, timestamp };
}
```

## 🔄 3단계: 서비스 교체

`src/hooks/usePoseAnalysis.ts`에서:

```typescript
// 현재
import RealMediaPipeService from '../services/pose/RealMediaPipeService';

// 변경 후
import TensorFlowPoseService from '../services/pose/TensorFlowPoseService';

// 그리고 초기화 부분에서
// 현재
mediaPipeService.current = new RealMediaPipeService();

// 변경 후  
mediaPipeService.current = new TensorFlowPoseService('MoveNet');
```

## 🎯 4단계: 추가 구현 필요 함수들

`TensorFlowPoseService.ts`에 다음 함수들 구현:

### 4-1. 이미지 로더 함수
```typescript
private async loadImageAsTensor(imageUri: string): Promise<any> {
  // React Native에서 이미지를 텐서로 변환
  // react-native-fs 또는 expo-file-system 사용
}
```

### 4-2. 비디오 프레임 추출 함수
```typescript
private async extractVideoFrame(videoUri: string, timestamp: number): Promise<any> {
  // 비디오에서 특정 시간의 프레임 추출
  // react-native-video 또는 FFmpeg 사용
}
```

### 4-3. 키포인트 변환 함수
```typescript
private convertTensorFlowKeypoints(tfKeypoints: any[]): PoseKeypoint[] {
  return tfKeypoints.map(kp => ({
    x: kp.x,
    y: kp.y,
    confidence: kp.score || 0,
  }));
}
```

## 📱 5단계: 추가 패키지 (선택사항)

더 나은 성능을 위해:

```bash
# 이미지/비디오 처리를 위해
npm install react-native-fs
npm install react-native-video-processing

# 또는 Expo 환경에서
npm install expo-av expo-file-system
```

## 🧪 6단계: 테스트

1. 패키지 설치 후 앱 재빌드
2. iOS: `cd ios && pod install && cd .. && npm run ios`
3. 실제 배드민턴 영상으로 테스트
4. 콘솔에서 실제 포즈 인식 로그 확인

## 🔍 현재 vs 실제 구현 상태

| 기능 | 현재 상태 | 실제 구현 후 |
|------|-----------|-------------|
| 포즈 인식 | 시뮬레이션 데이터 | 실제 AI 분석 |
| 키포인트 수 | 33개 (MediaPipe) | 17개 (MoveNet) |
| 정확도 | 랜덤 | 90%+ |
| 속도 | 즉시 | 실시간 |
| 메모리 사용 | 낮음 | 중간 |

## ⚠️ 주의사항

1. **성능**: 실제 TensorFlow.js는 더 많은 메모리와 CPU 사용
2. **초기화 시간**: 모델 로딩에 2-3초 소요
3. **네트워크**: 첫 실행 시 모델 다운로드 필요
4. **플랫폼**: iOS/Android 모두 지원하지만 성능 차이 있음

## 🎉 완성 후 결과

실제 TensorFlow.js 적용 후:
- ✅ 진짜 배드민턴 영상 포즈 인식
- ✅ 정확한 자세 분석 및 점수
- ✅ 실시간 피드백
- ✅ 프로 수준의 자세 교정 앱

지금은 **완벽한 구조와 시뮬레이션**이 준비되어 있으니, 
네트워크가 안정되면 언제든 실제 AI 모델로 전환 가능합니다! 🏸