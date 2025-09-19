import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { launchImageLibrary, launchCamera, MediaType, ImagePickerResponse } from 'react-native-image-picker';

interface VideoUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface VideoInfo {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
}

export const useVideoUpload = () => {
  const [uploadState, setUploadState] = useState<VideoUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const selectVideoFromLibrary = useCallback((): Promise<VideoInfo | null> => {
    return new Promise((resolve) => {
      const options = {
        mediaType: 'video' as MediaType,
        videoQuality: 'medium' as const,
        durationLimit: 30, // 30초 제한
        includeBase64: false,
      };

      launchImageLibrary(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) {
          resolve(null);
          return;
        }

        const asset = response.assets?.[0];
        if (asset && asset.uri) {
          const videoInfo: VideoInfo = {
            uri: asset.uri,
            fileName: asset.fileName,
            type: asset.type,
            fileSize: asset.fileSize,
            duration: asset.duration,
            width: asset.width,
            height: asset.height,
          };
          resolve(videoInfo);
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  const recordVideo = useCallback((): Promise<VideoInfo | null> => {
    return new Promise((resolve) => {
      const options = {
        mediaType: 'video' as MediaType,
        videoQuality: 'medium' as const,
        durationLimit: 30, // 30초 제한
        includeBase64: false,
      };

      launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) {
          resolve(null);
          return;
        }

        const asset = response.assets?.[0];
        if (asset && asset.uri) {
          const videoInfo: VideoInfo = {
            uri: asset.uri,
            fileName: asset.fileName,
            type: asset.type,
            fileSize: asset.fileSize,
            duration: asset.duration,
            width: asset.width,
            height: asset.height,
          };
          resolve(videoInfo);
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  const uploadVideo = useCallback(async (type: 'reference' | 'user'): Promise<VideoInfo | null> => {
    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      // 업로드 방식 선택
      const result = await new Promise<VideoInfo | null>((resolve) => {
        Alert.alert(
          `${type === 'reference' ? '기준' : '내'} 영상 선택`,
          '영상을 선택하거나 새로 촬영하세요.',
          [
            {
              text: '갤러리에서 선택',
              onPress: async () => {
                const video = await selectVideoFromLibrary();
                resolve(video);
              }
            },
            {
              text: '새로 촬영',
              onPress: async () => {
                const video = await recordVideo();
                resolve(video);
              }
            },
            {
              text: '취소',
              style: 'cancel',
              onPress: () => resolve(null)
            }
          ]
        );
      });

      if (result) {
        // 업로드 진행률 시뮬레이션
        for (let i = 0; i <= 100; i += 10) {
          setUploadState(prev => ({ ...prev, progress: i }));
          await new Promise<void>(resolve => setTimeout(resolve, 50));
        }

        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 100,
        }));

        return result;
      } else {
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 0,
        }));
        return null;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState(prev => ({
        ...prev,
        error: errorMessage,
        isUploading: false,
      }));
      
      Alert.alert('업로드 실패', errorMessage);
      return null;
    }
  }, [selectVideoFromLibrary, recordVideo]);

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    uploadState,
    uploadVideo,
    selectVideoFromLibrary,
    recordVideo,
    resetUploadState,
  };
};