import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  total?: number; // Optional text label logic can be added later
  style?: ViewStyle;
  height?: number;
  color?: string;
  trackColor?: string;
}

export function ProgressBar({
  progress,
  style,
  height = 8,
  color = COLORS.primary,
  trackColor = COLORS.surfaceHighlight,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { height, backgroundColor: trackColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
          },
        ]}
      />
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
