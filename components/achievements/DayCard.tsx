import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { COLORS, RADIUS, FONT_SIZE } from '@/constants/theme';

interface DayCardProps {
  day: number;
  label?: string;
  isReached: boolean;
  isCurrent: boolean;
}

export function DayCard({ day, label, isReached, isCurrent }: DayCardProps) {
  return (
    <View
      style={[
        styles.card,
        isReached && styles.reached,
        isCurrent && styles.current,
      ]}
    >
      <Text style={[styles.dayLabel, isReached && styles.reachedText]}>DAY</Text>
      <Text style={[styles.day, isReached && styles.reachedText]}>{day}</Text>
      {label ? (
        <Text style={[styles.name, isReached && styles.reachedText]} numberOfLines={1}>
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
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 4,
  },
  reached: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: COLORS.cyan,
  },
  current: {
    borderWidth: 2,
    borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  day: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reachedText: {
    color: COLORS.cyan,
  },
});
