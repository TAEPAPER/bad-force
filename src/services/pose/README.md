# BadForce 포즈 인식 서비스

BadForce 앱의 포즈 인식 기능을 담당하는 서비스들입니다.

## 📁 서비스 파일들

### 1. `MediaPipeService.ts` (기본)
- 웹 기반 MediaPipe 포즈 인식 (데모용)
- DOM 요소 필요로 React Native에서 직접 사용 불가
- 33개 키포인트 지원

### 2. `RealMediaPipeService.ts` (향상된 시뮬레이션)
- React Native 환경에 맞춘 포즈 분석 인터페이스
- 더 현실적인 포즈 데이터 생성
- 배드민턴 동작 시뮬레이션

### 3. `TensorFlowPoseService.ts` ⭐ (실제 AI 모델 준비)
- TensorFlow.js 기반 실제 포즈 인식 준비
- MoveNet 모델 사용 (17개 키포인트)
- 실제 구현을 위한 완전한 인터페이스

## 🚀 실제 TensorFlow.js 포즈 인식 구현하기

### 필요한 패키지 설치
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow-models/pose-detection
```

### TensorFlowPoseService.ts에서 TODO 주석 제거하고 실제 코드 활성화

```typescript
// 1. 임포트 주석 해제
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as poseDetection from '@tensorflow-models/pose-detection';

// 2. initializeTensorFlow() 메서드에서 실제 초기화 코드 활성화
await tf.ready();
const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
};
this.model = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  detectorConfig
);

// 3. analyzeImage() 메서드에서 실제 분석 코드 활성화
const imageTensor = await this.loadImageAsTensor(imageSource.uri);
const poses = await this.model.estimatePoses(imageTensor);
imageTensor.dispose();
```

## 🏸 지원하는 포즈 인식 모델

### MoveNet (추천)
- **속도**: 매우 빠름 (실시간)
- **정확도**: 높음
- **키포인트**: 17개
- **용도**: 실시간 배드민턴 자세 분석

### PoseNet
- **속도**: 빠름
- **정확도**: 중간
- **키포인트**: 17개
- **용도**: 기본 포즈 인식

### BlazePose
- **속도**: 중간
- **정확도**: 매우 높음
- **키포인트**: 33개
- **용도**: 정밀한 포즈 분석

## 📊 키포인트 매핑

### MoveNet 17개 키포인트
```
0: nose           5: left_shoulder    11: left_hip
1: left_eye       6: right_shoulder   12: right_hip  
2: right_eye      7: left_elbow       13: left_knee
3: left_ear       8: right_elbow      14: right_knee
4: right_ear      9: left_wrist       15: left_ankle
                 10: right_wrist      16: right_ankle
```

### 배드민턴 분석에 중요한 키포인트
- **어깨** (5, 6): 스윙 준비 자세
- **팔꿈치** (7, 8): 팔 각도와 파워
- **손목** (9, 10): 라켓 컨트롤
- **엉덩이** (11, 12): 무게중심 이동
- **무릎** (13, 14): 하체 안정성

## 🔄 현재 사용 중인 서비스

`src/hooks/usePoseAnalysis.ts`에서 현재 `RealMediaPipeService`를 사용 중입니다.

실제 TensorFlow.js를 사용하려면:
```typescript
// usePoseAnalysis.ts에서
import TensorFlowPoseService from '../services/pose/TensorFlowPoseService';

// 그리고 서비스 초기화 시
mediaPipeService.current = new TensorFlowPoseService('MoveNet');
```

## 📝 사용 예시

```typescript
const poseService = new TensorFlowPoseService('MoveNet');

// 이미지 분석
const poseData = await poseService.analyzeImage({
  uri: 'file://image.jpg'
});

// 비디오 분석
await poseService.analyzeVideo(
  { uri: 'file://video.mp4', duration: 3 },
  (frameData) => console.log('Frame analyzed:', frameData),
  () => console.log('Analysis complete')
);
```

## 🎯 다음 단계

1. ✅ TensorFlow.js 패키지 설치
2. ⏳ TensorFlowPoseService TODO 주석 제거
3. ⏳ 실제 이미지/비디오 처리 구현
4. ⏳ 성능 최적화 및 메모리 관리
5. ⏳ 실제 배드민턴 영상으로 테스트