import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

interface TodayUsageCardProps {
  todayMs: number;
  yesterdayMs?: number;
}

function formatDuration(ms: number, t: (key: string, params?: Record<string, any>) => string): { value: string; unit: string } {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return { value: '0', unit: t('usage.minutes') };
  if (totalMinutes < 60) return { value: String(totalMinutes), unit: t('usage.minutes') };
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return { value: String(hours), unit: t('usage.hours') };
  return { value: t('usage.hoursMinutes', { hours, minutes }), unit: t('usage.minutes') };
}

export function TodayUsageCard({ todayMs, yesterdayMs }: TodayUsageCardProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { value, unit } = formatDuration(todayMs, t);

  const showTrend = yesterdayMs !== undefined && yesterdayMs > 0;
  let trendIcon: 'arrow-down' | 'arrow-up' | 'remove' = 'remove';
  let trendColor = colors.textSecondary;
  let trendText = '';

  if (showTrend) {
    const diff = todayMs - yesterdayMs;
    const pct = Math.round((diff / yesterdayMs) * 100);
    if (pct < -5) {
      trendIcon = 'arrow-down';
      trendColor = colors.success;
      trendText = `${Math.abs(pct)}% ${t('usage.decreased')}`;
    } else if (pct > 5) {
      trendIcon = 'arrow-up';
      trendColor = colors.danger;
      trendText = `${pct}% ${t('usage.increased')}`;
    } else {
      trendText = t('usage.similarPrevDay');
    }
  }

  return (
    <Card style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('usage.todayViewTime')}</Text>
      <View style={styles.row}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>
      </View>
      {showTrend && (
        <View style={styles.trendRow}>
          <Ionicons name={trendIcon} size={14} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {trendText}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: FONT_SIZE.display,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
    lineHeight: FONT_SIZE.display * 1.1,
  },
  unit: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 4,
  },
  trendText: {
    fontSize: FONT_SIZE.sm,
  },
});
