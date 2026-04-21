import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface StepBadgeProps {
  step: number;
}

export function StepBadge({ step }: StepBadgeProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: `${colors.primary}26` }]}>
      <Text style={[styles.text, { color: colors.primary }]}>STEP {step}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.xs,
  },
});
