import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { renderIllustration } from './illustrations/renderIllustration';
import type { EducationSlide } from '@/constants/education';

interface EducationSlideStepProps {
  slide: EducationSlide;
  slideIndex: number;
  totalSlides: number;
}

function PageDots({ current, total }: { current: number; total: number }) {
  const { colors } = useTheme();
  return (
    <View testID="page-dots" style={styles.dotsContainer}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          testID={i === current ? `page-dot-active-${i}` : `page-dot-${i}`}
          style={[
            styles.dot,
            i === current && { backgroundColor: colors.contrastText, width: 24, borderRadius: 4 },
          ]}
        />
      ))}
    </View>
  );
}

export function EducationSlideStep({
  slide,
  slideIndex,
  totalSlides,
}: EducationSlideStepProps) {
  const { colors } = useTheme();

  return (
    <View testID="education-slide-container" style={styles.container}>
      <PageDots current={slideIndex} total={totalSlides} />

      <View style={styles.illustrationContainer}>
        {renderIllustration(slide.illustrationType)}
      </View>

      <Text style={[styles.title, { color: colors.contrastText }]}>{slide.title}</Text>
      <Text style={[styles.body, { color: `${colors.contrastText}CC` }]}>{slide.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  body: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
  },
});
