import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { GradientCard } from '@/components/ui/GradientCard';
import type { FeatureItem } from '@/constants/preBenefits';

interface FeatureShowcaseProps {
  features: FeatureItem[];
}

export function FeatureShowcase({ features }: FeatureShowcaseProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Rewireの仕組み:</Text>

      {features.map((feature, index) => (
        <GradientCard key={index} style={styles.featureCard}>
          <View style={styles.featureRow}>
            <Text style={styles.emoji}>{feature.emoji}</Text>
            <View style={styles.textContainer}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.description}</Text>
            </View>
          </View>
        </GradientCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  featureCard: {
    marginBottom: SPACING.md,
  },
  featureRow: {
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
  featureTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
});
