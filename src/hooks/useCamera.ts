import { useRef, useState, useCallback } from 'react';
import { Camera, CameraDevice } from 'react-native-vision-camera';

interface CameraSettings {
  resolution: 'low' | 'medium' | 'high';
  fps: number;
  facing: 'front' | 'back';
}

interface CameraState {
  isActive: boolean;
  isRecording: boolean;
  devices: CameraDevice[];
  currentDevice: CameraDevice | null;
  settings: CameraSettings;
}

export const useCamera = () => {
  const cameraRef = useRef<Camera>(null);
  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    isRecording: false,
    devices: [],
    currentDevice: null,
    settings: {
      resolution: 'medium',
      fps: 30,
      facing: 'front',
    },
  });

  const initializeCamera = useCallback(async () => {
    try {
      const devices = await Camera.getAvailableCameraDevices();
      const frontCamera = devices.find(device => device.position === 'front');
      const backCamera = devices.find(device => device.position === 'back');
      
      const preferredDevice = cameraState.settings.facing === 'front' ? frontCamera : backCamera;
      
      setCameraState(prev => ({
        ...prev,
        devices,
        currentDevice: preferredDevice || devices[0] || null,
      }));
      
      return preferredDevice || devices[0];
    } catch (error) {
      console.error('Camera initialization error:', error);
      return null;
    }
  }, [cameraState.settings.facing]);

  const startCamera = useCallback(() => {
    setCameraState(prev => ({ ...prev, isActive: true }));
  }, []);

  const stopCamera = useCallback(() => {
    setCameraState(prev => ({ ...prev, isActive: false, isRecording: false }));
  }, []);

  const switchCamera = useCallback(() => {
    setCameraState(prev => {
      const newFacing = prev.settings.facing === 'front' ? 'back' : 'front';
      const newDevice = prev.devices.find(device => 
        device.position === newFacing
      );
      
      return {
        ...prev,
        currentDevice: newDevice || prev.currentDevice,
        settings: {
          ...prev.settings,
          facing: newFacing,
        },
      };
    });
  }, []);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || cameraState.isRecording) return;

    try {
      setCameraState(prev => ({ ...prev, isRecording: true }));
      
      await cameraRef.current.startRecording({
        onRecordingFinished: (video) => {
          console.log('Recording finished:', video.path);
          setCameraState(prev => ({ ...prev, isRecording: false }));
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          setCameraState(prev => ({ ...prev, isRecording: false }));
        },
      });
    } catch (error) {
      console.error('Start recording error:', error);
      setCameraState(prev => ({ ...prev, isRecording: false }));
    }
  }, [cameraState.isRecording]);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !cameraState.isRecording) return;

    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  }, [cameraState.isRecording]);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return null;

    try {
      const photo = await cameraRef.current.takePhoto({});
      return photo;
    } catch (error) {
      console.error('Take picture error:', error);
      return null;
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<CameraSettings>) => {
    setCameraState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  return {
    cameraRef,
    cameraState,
    initializeCamera,
    startCamera,
    stopCamera,
    switchCamera,
    startRecording,
    stopRecording,
    takePicture,
    updateSettings,
  };
};