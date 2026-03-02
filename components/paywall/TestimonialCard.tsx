import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { GradientCard } from '@/components/ui/GradientCard';

interface TestimonialCardProps {
  quote: string;
  rating: number;
  author: string;
}

export function TestimonialCard({ quote, rating, author }: TestimonialCardProps) {
  const { colors } = useTheme();
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <GradientCard style={styles.card}>
      <Text testID="testimonial-stars" style={styles.stars}>{stars}</Text>
      <Text style={[styles.quote, { color: colors.text }]}>'{quote}'</Text>
      <Text style={[styles.author, { color: colors.textSecondary }]}>{author}</Text>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  stars: {
    fontSize: FONT_SIZE.xl,
    color: '#F0A030',
    marginBottom: SPACING.md,
    letterSpacing: 2,
  },
  quote: {
    fontSize: FONT_SIZE.md,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  author: {
    fontSize: FONT_SIZE.sm,
  },
});
