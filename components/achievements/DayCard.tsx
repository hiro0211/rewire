import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { COLORS, RADIUS, FONT_SIZE } from '@/constants/theme';

interface DayCardProps {
  day: number;
  isReached: boolean;
  isCurrent: boolean;
}

export function DayCard({ day, isReached, isCurrent }: DayCardProps) {
  return (
    <View
      style={[
        styles.card,
        isReached && styles.reached,
        isCurrent && styles.current,
      ]}
    >
      <Text style={[styles.label, isReached && styles.reachedText]}>DAY</Text>
      <Text style={[styles.day, isReached && styles.reachedText]}>{day}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 64,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  day: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  reachedText: {
    color: COLORS.cyan,
  },
});
