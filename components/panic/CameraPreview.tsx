import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { CAMERA_ASPECT_RATIO } from '@/constants/panic';
import { useCameraPermission } from '@/hooks/panic/useCameraPermission';
import { useLocale } from '@/hooks/useLocale';

/**
 * Shows the front camera preview on the panic screen so the user can confront
 * their own face while deciding what to do. Falls back to a gradient prompt if
 * permission has not been granted yet, and to a static message if the user
 * denied the request. The fallback must not block the rest of the screen.
 */
export function CameraPreview() {
  const { hasPermission, isLoading, requestPermission } = useCameraPermission();
  const { t } = useLocale();

  if (hasPermission) {
    return (
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFillObject} facing="front" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={StyleSheet.absoluteFillObject}
      />
      {!isLoading && (
        <Pressable
          testID="camera-permission-request"
          onPress={() => {
            requestPermission();
          }}
          style={styles.permissionButton}
        >
          <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
          <Text style={styles.permissionText}>{t('panic.cameraPrompt')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: CAMERA_ASPECT_RATIO,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
