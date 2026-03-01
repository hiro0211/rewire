import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { GradientCard } from '@/components/ui/GradientCard';
import type { BenefitSection as BenefitSectionType } from '@/constants/preBenefits';

interface BenefitSectionProps {
  section: BenefitSectionType;
}

export function BenefitSection({ section }: BenefitSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionEmoji}>{section.emoji}</Text>
      <Text style={styles.title}>{section.title}</Text>

      {section.benefits.map((benefit, index) => (
        <View key={index} style={styles.benefitRow}>
          <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
          <Text style={styles.benefitText}>
            <Text style={styles.benefitBold}>{benefit.bold}</Text>
            {benefit.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  sectionEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  benefitEmoji: {
    fontSize: FONT_SIZE.lg,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
  benefitBold: {
    fontWeight: '700',
    color: COLORS.text,
  },
});
