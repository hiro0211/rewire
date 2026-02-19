import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

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

  // Fun comparisons
  const books = Math.floor(monthlyYen / 1500);
  const movies = Math.floor(monthlyYen / 2000);

  return (
    <Card style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="cash-outline" size={20} color={COLORS.warning} />
        <Text style={styles.title}>金額に換算すると</Text>
      </View>

      <View style={styles.mainAmount}>
        <Text style={styles.amountPrefix}>今月</Text>
        <Text style={styles.time}>{formatHoursMinutes(monthlyMs)}</Text>
        <Text style={styles.arrow}> = </Text>
        <Text style={styles.yen}>¥{monthlyYen.toLocaleString()}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>年間換算</Text>
        <Text style={styles.detailValue}>¥{yearlyYen.toLocaleString()}</Text>
      </View>

      {monthlyYen > 0 && (
        <View style={styles.comparisons}>
          {books > 0 && (
            <Text style={styles.comparison}>
              本 {books}冊分
            </Text>
          )}
          {movies > 0 && (
            <Text style={styles.comparison}>
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
    color: COLORS.text,
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginRight: SPACING.xs,
  },
  time: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  arrow: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    marginHorizontal: SPACING.xs,
  },
  yen: {
    color: COLORS.warning,
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceHighlight,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  comparisons: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.xs,
  },
  comparison: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
  },
});
