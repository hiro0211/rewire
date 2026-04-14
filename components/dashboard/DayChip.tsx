import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SPACING, FONT_SIZE } from '@/constants/theme';

interface DayChipProps {
  day: number;
}

export function DayChip({ day }: DayChipProps) {
  const { colors } = useTheme();

  return (
    <View
      testID="day-chip"
      style={[
        styles.pill,
        {
          backgroundColor: colors.pillBackground,
          borderColor: colors.pillBorder,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>
        🌙 Day {day}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
