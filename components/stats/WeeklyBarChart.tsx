import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import type { DailyUsage } from '@/types/usage';

interface WeeklyBarChartProps {
  data: DailyUsage[];
}

const DAY_LABEL_KEYS = [
  'weekDaysShort.mon', 'weekDaysShort.tue', 'weekDaysShort.wed',
  'weekDaysShort.thu', 'weekDaysShort.fri', 'weekDaysShort.sat', 'weekDaysShort.sun',
];
const BAR_MAX_HEIGHT = 120;

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  const maxDuration = Math.max(...data.map((d) => d.totalDuration), 1);
  const { colors } = useTheme();
  const { t } = useLocale();

  const getDayLabel = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDay();
    return t(DAY_LABEL_KEYS[day === 0 ? 6 : day - 1]);
  };

  const formatMinutes = (ms: number): string => {
    const min = Math.round(ms / 60000);
    if (min < 60) return t('stats.minuteFormat', { min });
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  };

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('stats.weeklyTrend')}</Text>
      <View style={styles.chartArea}>
        {data.map((day, i) => {
          const height = (day.totalDuration / maxDuration) * BAR_MAX_HEIGHT;
          const isToday = i === data.length - 1;
          return (
            <View key={day.date} style={styles.barColumn}>
              <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                {day.totalDuration > 0 ? formatMinutes(day.totalDuration) : ''}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(height, 2),
                      backgroundColor: isToday
                        ? colors.primary
                        : `${colors.primary}80`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }, isToday && { color: colors.primary, fontWeight: '600' }]}>
                {getDayLabel(day.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + 50,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 10,
    marginBottom: 4,
    height: 14,
  },
  barTrack: {
    width: '100%',
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '50%',
    maxWidth: 28,
    borderRadius: RADIUS.sm,
    minHeight: 2,
  },
  dayLabel: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
});
