import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SPACING } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderColor?: string;
  testID?: string;
}

export function GlassCard({
  children,
  style,
  intensity = 40,
  borderColor,
  testID,
}: GlassCardProps) {
  const { colors, isDark } = useTheme();

  const resolvedBorderColor = borderColor ?? colors.borderGlass;

  if (isDark) {
    return (
      <View
        testID={testID}
        style={[
          styles.outer,
          { borderColor: resolvedBorderColor },
          style,
        ]}
      >
        <BlurView
          intensity={intensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.innerOverlay, { backgroundColor: colors.surfaceGlass }]} />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // Light mode: simple semi-transparent background, skip BlurView for performance
  return (
    <View
      testID={testID}
      style={[
        styles.outer,
        {
          borderColor: resolvedBorderColor,
          backgroundColor: colors.surfaceGlass,
        },
        style,
      ]}
    >
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  innerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: SPACING.lg,
  },
});
