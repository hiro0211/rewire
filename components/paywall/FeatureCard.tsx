import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GradientCard } from '@/components/ui/GradientCard';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
}

export function FeatureCard({ emoji, title, description }: FeatureCardProps) {
  const { colors } = useTheme();

  return (
    <GradientCard style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginRight: SPACING.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
});
