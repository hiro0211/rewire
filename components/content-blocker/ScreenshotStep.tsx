import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ScreenshotStepProps {
  image: ImageSourcePropType;
  highlight: HighlightPosition;
}

export function ScreenshotStep({ image, highlight }: ScreenshotStepProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <Image source={image} style={[styles.image, { backgroundColor: colors.surface }]} resizeMode="contain" />
      <View
        style={[
          styles.highlight,
          {
            top: `${highlight.top}%` as any,
            left: `${highlight.left}%` as any,
            width: `${highlight.width}%` as any,
            height: `${highlight.height}%` as any,
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}26`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 340,
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: RADIUS.sm,
  },
});
