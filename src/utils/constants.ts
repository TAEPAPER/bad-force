// Camera settings
export const CAMERA_SETTINGS = {
  RESOLUTION: {
    LOW: { width: 640, height: 480 },
    MEDIUM: { width: 1280, height: 720 },
    HIGH: { width: 1920, height: 1080 },
  },
  FPS: {
    LOW: 15,
    MEDIUM: 30,
    HIGH: 60,
  },
  QUALITY: {
    LOW: 0.3,
    MEDIUM: 0.7,
    HIGH: 1.0,
  },
} as const;

// Permission messages
export const PERMISSION_MESSAGES = {
  CAMERA: {
    TITLE: '카메라 권한 요청',
    MESSAGE: 'BadForce 앱이 자세 분석을 위해 카메라 접근 권한이 필요합니다.',
    DENIED_TITLE: '카메라 권한 필요',
    DENIED_MESSAGE: '자세 분석을 위해 카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
  },
  MICROPHONE: {
    TITLE: '마이크 권한 요청',
    MESSAGE: 'BadForce 앱이 영상 녹화를 위해 마이크 접근 권한이 필요합니다.',
    DENIED_TITLE: '마이크 권한 필요',
    DENIED_MESSAGE: '영상 녹화를 위해 마이크 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
  },
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_SETTINGS: '@BadForce:userSettings',
  ANALYSIS_RESULTS: '@BadForce:analysisResults',
  CAMERA_SETTINGS: '@BadForce:cameraSettings',
  FIRST_LAUNCH: '@BadForce:firstLaunch',
} as const;

// App colors
export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#34C759',
  ERROR: '#FF3B30',
  WARNING: '#FF9500',
  SUCCESS: '#30D158',
  
  // Grays
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GRAY_LIGHT: '#F8F9FA',
  GRAY_MEDIUM: '#8E8E93',
  GRAY_DARK: '#48484A',
  
  // Backgrounds
  BACKGROUND_PRIMARY: '#FFFFFF',
  BACKGROUND_SECONDARY: '#F8F9FA',
  BORDER: '#E5E5EA',
} as const;

// Pose detection settings
export const POSE_SETTINGS = {
  CONFIDENCE_THRESHOLD: 0.5,
  SMOOTHING_FACTOR: 0.7,
  MAX_POSE_HISTORY: 30, // frames
  ANALYSIS_INTERVAL: 100, // ms
} as const;

// Shot type configurations
export const SHOT_TYPES = {
  SMASH: 'smash',
  SERVE: 'serve',
  CLEAR: 'clear',
  DROP: 'drop',
  NET: 'net',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  CAMERA_NOT_AVAILABLE: '카메라를 사용할 수 없습니다.',
  PERMISSION_DENIED: '권한이 거부되었습니다.',
  RECORDING_FAILED: '녹화에 실패했습니다.',
  ANALYSIS_FAILED: '분석에 실패했습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  STORAGE_ERROR: '저장 중 오류가 발생했습니다.',
} as const;