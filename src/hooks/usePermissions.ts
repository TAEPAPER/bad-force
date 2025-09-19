import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

interface PermissionState {
  camera: boolean;
  microphone: boolean;
  isLoading: boolean;
  hasChecked: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: false,
    microphone: false,
    isLoading: true,
    hasChecked: false,
  });

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한 요청',
            message: 'BadForce 앱이 자세 분석을 위해 카메라 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '마이크 권한 요청',
            message: 'BadForce 앱이 영상 녹화를 위해 마이크 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.MICROPHONE);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Microphone permission error:', error);
      return false;
    }
  };

  const checkPermissions = async () => {
    setPermissions(prev => ({ ...prev, isLoading: true }));

    try {
      let cameraGranted = false;
      let microphoneGranted = false;

      if (Platform.OS === 'android') {
        cameraGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        microphoneGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
      } else {
        const cameraResult = await check(PERMISSIONS.IOS.CAMERA);
        const micResult = await check(PERMISSIONS.IOS.MICROPHONE);
        cameraGranted = cameraResult === RESULTS.GRANTED;
        microphoneGranted = micResult === RESULTS.GRANTED;
      }

      setPermissions({
        camera: cameraGranted,
        microphone: microphoneGranted,
        isLoading: false,
        hasChecked: true,
      });
    } catch (error) {
      console.error('Check permissions error:', error);
      setPermissions(prev => ({ ...prev, isLoading: false, hasChecked: true }));
    }
  };

  const requestAllPermissions = async (): Promise<boolean> => {
    const cameraGranted = await requestCameraPermission();
    const microphoneGranted = await requestMicrophonePermission();

    setPermissions({
      camera: cameraGranted,
      microphone: microphoneGranted,
      isLoading: false,
      hasChecked: true,
    });

    if (!cameraGranted) {
      Alert.alert(
        '권한 필요',
        '카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
        [{ text: '확인' }]
      );
      return false;
    }

    return cameraGranted;
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    permissions,
    requestAllPermissions,
    checkPermissions,
    requestCameraPermission,
    requestMicrophonePermission,
  };
};