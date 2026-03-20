import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { GradientCard } from '@/components/ui/GradientCard';
import type { FeatureItem } from '@/constants/preBenefits';

interface FeatureShowcaseProps {
  features: FeatureItem[];
}

export function FeatureShowcase({ features }: FeatureShowcaseProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('paywall.howItWorks')}</Text>

      {features.map((feature, index) => (
        <GradientCard key={index} style={styles.featureCard}>
          <View style={styles.featureRow}>
            <Text style={styles.emoji}>{feature.emoji}</Text>
            <View style={styles.textContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{t(feature.titleKey)}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{t(feature.descriptionKey)}</Text>
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
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
});
