import { useState, useRef, useCallback } from 'react';
import { PoseData, ShotType, AnalysisResult } from '../types';
import MediaPipeWebService from '../services/pose/MediaPipeWebService';
import PoseComparisonService from '../services/analysis/PoseComparisonService';

interface AnalysisState {
  isAnalyzing: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
}

export const usePoseAnalysis = () => {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    currentStep: '',
    error: null,
  });

  const mediaPipeService = useRef<MediaPipeWebService | null>(null);
  const comparisonService = useRef<PoseComparisonService | null>(null);

  const initializeServices = useCallback(async () => {
    try {
      if (!mediaPipeService.current) {
        mediaPipeService.current = new MediaPipeWebService();
      }
      if (!comparisonService.current) {
        comparisonService.current = new PoseComparisonService();
      }
    } catch (error) {
      console.error('Service initialization failed:', error);
      setAnalysisState(prev => ({
        ...prev,
        error: 'Analysis services initialization failed'
      }));
    }
  }, []);

  const analyzeReferenceVideo = useCallback(async (
    videoSource: { uri: string; duration?: number },
    shotType: ShotType
  ): Promise<PoseData[]> => {
    if (!mediaPipeService.current) {
      throw new Error('MediaPipe service not initialized');
    }

    return new Promise((resolve, reject) => {
      const poses: PoseData[] = [];
      let frameCount = 0;
      const totalFrames = Math.floor((videoSource.duration || 2) * 30); // 30fps 가정

      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: true,
        progress: 0,
        currentStep: '기준 영상 분석 중...',
        error: null
      }));

      const onFrame = (poseData: PoseData) => {
        poses.push({
          ...poseData,
          shotType
        });
        frameCount++;
        
        const progress = Math.min((frameCount / totalFrames) * 50, 50); // 50%까지
        setAnalysisState(prev => ({
          ...prev,
          progress
        }));
      };

      const onComplete = () => {
        setAnalysisState(prev => ({
          ...prev,
          progress: 50,
          currentStep: '기준 영상 분석 완료'
        }));
        resolve(poses);
      };

      mediaPipeService.current?.analyzeVideo(videoSource, onFrame, onComplete)
        .catch(reject);
    });
  }, []);

  const analyzeUserVideo = useCallback(async (
    videoSource: { uri: string; duration?: number },
    shotType: ShotType
  ): Promise<PoseData[]> => {
    if (!mediaPipeService.current) {
      throw new Error('MediaPipe service not initialized');
    }

    return new Promise((resolve, reject) => {
      const poses: PoseData[] = [];
      let frameCount = 0;
      const totalFrames = Math.floor((videoSource.duration || 2) * 30); // 30fps 가정

      setAnalysisState(prev => ({
        ...prev,
        progress: 50,
        currentStep: '사용자 영상 분석 중...'
      }));

      const onFrame = (poseData: PoseData) => {
        poses.push({
          ...poseData,
          shotType
        });
        frameCount++;
        
        const progress = 50 + Math.min((frameCount / totalFrames) * 40, 40); // 50%에서 90%까지
        setAnalysisState(prev => ({
          ...prev,
          progress
        }));
      };

      const onComplete = () => {
        setAnalysisState(prev => ({
          ...prev,
          progress: 90,
          currentStep: '사용자 영상 분석 완료'
        }));
        resolve(poses);
      };

      mediaPipeService.current?.analyzeVideo(videoSource, onFrame, onComplete)
        .catch(reject);
    });
  }, []);

  const compareVideos = useCallback(async (
    referenceVideo: { uri: string; duration?: number },
    userVideo: { uri: string; duration?: number },
    shotType: ShotType
  ): Promise<AnalysisResult> => {
    try {
      await initializeServices();

      // 1. 기준 영상 분석
      const referencePoses = await analyzeReferenceVideo(referenceVideo, shotType);

      // 2. 사용자 영상 분석
      const userPoses = await analyzeUserVideo(userVideo, shotType);

      // 3. 비교 분석
      setAnalysisState(prev => ({
        ...prev,
        progress: 90,
        currentStep: '자세 비교 분석 중...'
      }));

      if (!comparisonService.current) {
        throw new Error('Comparison service not available');
      }

      const comparison = comparisonService.current.comparePoses(
        referencePoses,
        userPoses,
        shotType
      );

      // 4. 결과 생성
      const analysisResult: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        poseData: userPoses,
        score: comparison.overallScore,
        feedback: comparison.feedback,
        recommendations: comparison.recommendations,
        createdAt: new Date()
      };

      setAnalysisState(prev => ({
        ...prev,
        progress: 100,
        currentStep: '분석 완료',
        isAnalyzing: false
      }));

      return analysisResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setAnalysisState(prev => ({
        ...prev,
        error: errorMessage,
        isAnalyzing: false
      }));
      throw error;
    }
  }, [initializeServices, analyzeReferenceVideo, analyzeUserVideo]);

  const analyzeImage = useCallback(async (
    imageSource: { uri: string },
    shotType: ShotType
  ): Promise<PoseData | null> => {
    try {
      await initializeServices();
      
      if (!tensorFlowService.current) {
        throw new Error('TensorFlow service not initialized');
      }

      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: true,
        progress: 0,
        currentStep: '이미지 분석 중...',
        error: null
      }));

      const poseData = await mediaPipeService.current.analyzeImage(imageSource);
      
      setAnalysisState(prev => ({
        ...prev,
        progress: 100,
        currentStep: '분석 완료',
        isAnalyzing: false
      }));

      return poseData ? { ...poseData, shotType } : null;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Image analysis failed';
      setAnalysisState(prev => ({
        ...prev,
        error: errorMessage,
        isAnalyzing: false
      }));
      throw error;
    }
  }, [initializeServices]);

  const resetAnalysis = useCallback(() => {
    setAnalysisState({
      isAnalyzing: false,
      progress: 0,
      currentStep: '',
      error: null,
    });
  }, []);

  const dispose = useCallback(() => {
    if (mediaPipeService.current) {
      mediaPipeService.current.dispose();
      mediaPipeService.current = null;
    }
    comparisonService.current = null;
  }, []);

  return {
    analysisState,
    compareVideos,
    analyzeImage,
    resetAnalysis,
    dispose,
    isReady: mediaPipeService.current?.isReady() || false
  };
};