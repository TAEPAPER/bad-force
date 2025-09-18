// Common types for BadForce app
export interface PoseKeypoint {
  x: number;
  y: number;
  confidence: number;
}

export interface PoseData {
  keypoints: PoseKeypoint[];
  timestamp: number;
  shotType?: ShotType;
}

export type ShotType = 'smash' | 'serve' | 'clear' | 'drop' | 'net';

export interface AnalysisResult {
  id: string;
  poseData: PoseData[];
  score: number;
  feedback: string[];
  recommendations: string[];
  createdAt: Date;
}

export interface UserSettings {
  cameraResolution: 'low' | 'medium' | 'high';
  analysisMode: 'realtime' | 'upload';
  soundEnabled: boolean;
  language: 'ko' | 'en';
}

export type NavigationStackParamList = {
  Home: undefined;
  Camera: undefined;
  Analysis: { analysisId?: string };
  Settings: undefined;
};