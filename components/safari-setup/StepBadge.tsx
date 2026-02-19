import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface StepBadgeProps {
  step: number;
}

export function StepBadge({ step }: StepBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>STEP {step}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: `${COLORS.primary}26`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
  },
  text: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.xs,
  },
});
