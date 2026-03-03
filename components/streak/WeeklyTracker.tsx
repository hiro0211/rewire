import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import { getWeeklyProgress, type DayStatus } from '@/hooks/streak/useWeeklyProgress';
import type { ColorPalette } from '@/types/theme';

interface WeeklyTrackerProps {
  streak: number;
  today?: Date;
}

export function WeeklyTracker({ streak, today = new Date() }: WeeklyTrackerProps) {
  const { colors, glow } = useTheme();
  const days = getWeeklyProgress(streak, today);

  return (
    <View
      testID="weekly-tracker"
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {days.map((day, index) => (
        <View key={index} style={styles.dayColumn}>
          <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
            {day.dayLabel}
          </Text>
          <DayDot day={day} colors={colors} glowPurple={glow.purple} />
        </View>
      ))}
    </View>
  );
}

function DayDot({
  day,
  colors,
  glowPurple,
}: {
  day: DayStatus;
  colors: ColorPalette;
  glowPurple: string;
}) {
  if (day.status === 'completed') {
    return (
      <View style={[styles.dot, styles.completedDot, { backgroundColor: colors.success }]}>
        <Text style={styles.checkmark}>✓</Text>
      </View>
    );
  }

  if (day.status === 'today') {
    return (
      <View
        style={[
          styles.dot,
          styles.todayDot,
          { backgroundColor: glowPurple, borderColor: '#8B5CF6' },
        ]}
      >
        <View style={[styles.todayInner, { backgroundColor: '#8B5CF6' }]} />
      </View>
    );
  }

  return (
    <View style={[styles.dot, styles.futureDot, { borderColor: colors.border }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  dayColumn: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dayLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedDot: {},
  todayDot: {
    borderWidth: 2,
  },
  todayInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  futureDot: {
    borderWidth: 1.5,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
