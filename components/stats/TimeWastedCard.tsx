import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface TimeWastedCardProps {
  monthlyMs: number;
  hourlyWage: number;
}

function formatHoursMinutes(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (hours === 0) return `${minutes}分`;
  return `${hours}時間${minutes}分`;
}

export function TimeWastedCard({ monthlyMs, hourlyWage }: TimeWastedCardProps) {
  const monthlyHours = monthlyMs / 3600000;
  const monthlyYen = Math.round(monthlyHours * hourlyWage);
  const yearlyYen = monthlyYen * 12;
  const { colors } = useTheme();

  // Fun comparisons
  const books = Math.floor(monthlyYen / 1500);
  const movies = Math.floor(monthlyYen / 2000);

  return (
    <Card style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="cash-outline" size={20} color={colors.warning} />
        <Text style={[styles.title, { color: colors.text }]}>金額に換算すると</Text>
      </View>

      <View style={styles.mainAmount}>
        <Text style={[styles.amountPrefix, { color: colors.textSecondary }]}>今月</Text>
        <Text style={[styles.time, { color: colors.text }]}>{formatHoursMinutes(monthlyMs)}</Text>
        <Text style={[styles.arrow, { color: colors.textSecondary }]}> = </Text>
        <Text style={[styles.yen, { color: colors.warning }]}>¥{monthlyYen.toLocaleString()}</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.surfaceHighlight }]} />

      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>年間換算</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>¥{yearlyYen.toLocaleString()}</Text>
      </View>

      {monthlyYen > 0 && (
        <View style={styles.comparisons}>
          {books > 0 && (
            <Text style={[styles.comparison, { color: colors.textSecondary }]}>
              本 {books}冊分
            </Text>
          )}
          {movies > 0 && (
            <Text style={[styles.comparison, { color: colors.textSecondary }]}>
              映画 {movies}本分
            </Text>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  mainAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  amountPrefix: {
    fontSize: FONT_SIZE.sm,
    marginRight: SPACING.xs,
  },
  time: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  arrow: {
    fontSize: FONT_SIZE.md,
    marginHorizontal: SPACING.xs,
  },
  yen: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
  },
  detailValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  comparisons: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.xs,
  },
  comparison: {
    fontSize: FONT_SIZE.xs,
  },
});
