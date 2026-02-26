import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  total?: number;
  style?: ViewStyle;
  height?: number;
  color?: string;
  trackColor?: string;
  variant?: 'default' | 'gradient';
}

export function ProgressBar({
  progress,
  style,
  height = 8,
  color = COLORS.primary,
  trackColor = COLORS.surfaceHighlight,
  variant = 'default',
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const barHeight = variant === 'gradient' ? 6 : height;

  return (
    <View style={[styles.container, { height: barHeight, backgroundColor: trackColor }, style]}>
      {variant === 'gradient' ? (
        <LinearGradient
          testID="progress-gradient"
          colors={['#4A90D9', '#00D4FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.fill,
            { width: `${clampedProgress * 100}%` },
          ]}
        />
      ) : (
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
});
