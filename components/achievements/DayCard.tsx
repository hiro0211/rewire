import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RADIUS, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface DayCardProps {
  day: number;
  label?: string;
  isReached: boolean;
  isCurrent: boolean;
}

export function DayCard({ day, label, isReached, isCurrent }: DayCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isReached && { backgroundColor: 'rgba(0, 212, 255, 0.12)', borderColor: colors.cyan },
        isCurrent && {
          borderWidth: 2,
          borderColor: colors.cyan,
          shadowColor: colors.cyan,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 4,
        },
      ]}
    >
      <Text style={[styles.dayLabel, { color: colors.textSecondary }, isReached && { color: colors.cyan }]}>DAY</Text>
      <Text style={[styles.day, { color: colors.textSecondary }, isReached && { color: colors.cyan }]}>{day}</Text>
      {label ? (
        <Text style={[styles.name, { color: colors.textSecondary }, isReached && { color: colors.cyan }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 72,
    height: 88,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  dayLabel: {
    fontSize: 10,
  },
  day: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  name: {
    fontSize: 9,
    marginTop: 2,
  },
});
