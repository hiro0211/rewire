import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { COLORS, RADIUS } from '@/constants/theme';

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
  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <View
        style={[
          styles.highlight,
          {
            top: `${highlight.top}%` as any,
            left: `${highlight.left}%` as any,
            width: `${highlight.width}%` as any,
            height: `${highlight.height}%` as any,
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
    borderColor: COLORS.border,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 340,
    backgroundColor: COLORS.surface,
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    backgroundColor: `${COLORS.primary}26`,
  },
});
