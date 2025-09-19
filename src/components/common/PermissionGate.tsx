import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, Header, LoadingSpinner } from './index';
import { COLORS } from '../../utils/constants';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredPermissions?: ('camera' | 'microphone')[];
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requiredPermissions = ['camera'],
}) => {
  const { permissions, requestAllPermissions, checkPermissions } = usePermissions();
  const [showPermissionUI, setShowPermissionUI] = useState(false);

  useEffect(() => {
    if (permissions.hasChecked && !permissions.isLoading) {
      const cameraRequired = requiredPermissions.includes('camera');
      const microphoneRequired = requiredPermissions.includes('microphone');
      
      const cameraGranted = !cameraRequired || permissions.camera;
      const microphoneGranted = !microphoneRequired || permissions.microphone;
      
      setShowPermissionUI(!(cameraGranted && microphoneGranted));
    }
  }, [permissions, requiredPermissions]);

  const handleRequestPermissions = async () => {
    const granted = await requestAllPermissions();
    if (granted) {
      setShowPermissionUI(false);
    }
  };

  const handleRetryCheck = () => {
    checkPermissions();
  };

  if (permissions.isLoading || !permissions.hasChecked) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="권한 확인 중..." />
      </SafeAreaView>
    );
  }

  if (showPermissionUI) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="권한 설정" />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📷</Text>
          </View>
          
          <Text style={styles.title}>카메라 권한이 필요합니다</Text>
          <Text style={styles.description}>
            배드민턴 자세 분석을 위해{'\n'}
            카메라 접근 권한이 필요합니다.
          </Text>

          <View style={styles.permissionList}>
            <PermissionItem
              title="카메라"
              description="실시간 자세 분석"
              granted={permissions.camera}
              required={requiredPermissions.includes('camera')}
            />
            {requiredPermissions.includes('microphone') && (
              <PermissionItem
                title="마이크"
                description="영상 녹화 기능"
                granted={permissions.microphone}
                required={true}
              />
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="권한 허용하기"
              onPress={handleRequestPermissions}
              variant="primary"
              style={styles.button}
            />
            <Button
              title="다시 확인"
              onPress={handleRetryCheck}
              variant="outline"
              style={styles.button}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};

interface PermissionItemProps {
  title: string;
  description: string;
  granted: boolean;
  required: boolean;
}

const PermissionItem: React.FC<PermissionItemProps> = ({
  title,
  description,
  granted,
  required,
}) => (
  <View style={styles.permissionItem}>
    <View style={styles.permissionIcon}>
      <Text style={styles.permissionStatus}>
        {granted ? '✅' : required ? '❌' : '⚠️'}
      </Text>
    </View>
    <View style={styles.permissionText}>
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionDescription}>{description}</Text>
    </View>
    <Text style={[
      styles.permissionLabel,
      granted ? styles.grantedLabel : styles.deniedLabel
    ]}>
      {granted ? '허용됨' : '거부됨'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.GRAY_MEDIUM,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionList: {
    width: '100%',
    marginBottom: 32,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionIcon: {
    marginRight: 12,
  },
  permissionStatus: {
    fontSize: 20,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
  },
  permissionLabel: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  grantedLabel: {
    color: COLORS.SUCCESS,
    backgroundColor: `${COLORS.SUCCESS}20`,
  },
  deniedLabel: {
    color: COLORS.ERROR,
    backgroundColor: `${COLORS.ERROR}20`,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    marginBottom: 0,
  },
});

export default PermissionGate;