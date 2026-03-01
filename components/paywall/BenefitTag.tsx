import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface BenefitTagProps {
  label: string;
  color: string;
  emoji: string;
}

export function BenefitTag({ label, color, emoji }: BenefitTagProps) {
  return (
    <View style={[styles.container, { borderColor: color, backgroundColor: `${color}18` }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  emoji: {
    fontSize: FONT_SIZE.sm,
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
});
