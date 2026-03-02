import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

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
  color,
  trackColor,
  variant = 'default',
}: ProgressBarProps) {
  const { colors, gradients } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const barHeight = variant === 'gradient' ? 6 : height;
  const resolvedColor = color ?? colors.primary;
  const resolvedTrackColor = trackColor ?? colors.surfaceHighlight;

  return (
    <View style={[styles.container, { height: barHeight, backgroundColor: resolvedTrackColor }, style]}>
      {variant === 'gradient' ? (
        <LinearGradient
          testID="progress-gradient"
          colors={[...gradients.accent]}
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
              backgroundColor: resolvedColor,
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
