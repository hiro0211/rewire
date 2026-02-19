import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface TodayUsageCardProps {
  todayMs: number;
  yesterdayMs?: number;
}

function formatDuration(ms: number): { value: string; unit: string } {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return { value: '0', unit: '分' };
  if (totalMinutes < 60) return { value: String(totalMinutes), unit: '分' };
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return { value: String(hours), unit: '時間' };
  return { value: `${hours}時間${minutes}`, unit: '分' };
}

export function TodayUsageCard({ todayMs, yesterdayMs }: TodayUsageCardProps) {
  const { value, unit } = formatDuration(todayMs);

  const showTrend = yesterdayMs !== undefined && yesterdayMs > 0;
  let trendIcon: 'arrow-down' | 'arrow-up' | 'remove' = 'remove';
  let trendColor = COLORS.textSecondary;
  let trendText = '';

  if (showTrend) {
    const diff = todayMs - yesterdayMs;
    const pct = Math.round((diff / yesterdayMs) * 100);
    if (pct < -5) {
      trendIcon = 'arrow-down';
      trendColor = COLORS.success;
      trendText = `${Math.abs(pct)}% 減少`;
    } else if (pct > 5) {
      trendIcon = 'arrow-up';
      trendColor = COLORS.danger;
      trendText = `${pct}% 増加`;
    } else {
      trendText = '前日と同程度';
    }
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.label}>今日の視聴時間</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: COLORS.text,
    fontSize: FONT_SIZE.display,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
    lineHeight: FONT_SIZE.display * 1.1,
  },
  unit: {
    color: COLORS.textSecondary,
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
