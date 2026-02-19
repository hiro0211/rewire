import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import type { DailyUsage } from '@/types/usage';

interface WeeklyBarChartProps {
  data: DailyUsage[];
}

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];
const BAR_MAX_HEIGHT = 120;

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  // JS getDay: 0=Sun, 1=Mon...
  return DAY_LABELS[day === 0 ? 6 : day - 1];
}

function formatMinutes(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  const maxDuration = Math.max(...data.map((d) => d.totalDuration), 1);

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>週間推移</Text>
      <View style={styles.chartArea}>
        {data.map((day, i) => {
          const height = (day.totalDuration / maxDuration) * BAR_MAX_HEIGHT;
          const isToday = i === data.length - 1;
          return (
            <View key={day.date} style={styles.barColumn}>
              <Text style={styles.barValue}>
                {day.totalDuration > 0 ? formatMinutes(day.totalDuration) : ''}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(height, 2),
                      backgroundColor: isToday
                        ? COLORS.primary
                        : `${COLORS.primary}80`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>
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
    color: COLORS.text,
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
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  dayLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
