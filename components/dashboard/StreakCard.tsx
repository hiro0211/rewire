import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useStreak } from '@/hooks/dashboard/useStreak';

export function StreakCard() {
  const { streak, goal, progress } = useStreak();

  return (
    <Card style={styles.container}>
      <Text style={styles.label}>現在の記録</Text>
      <View style={styles.row}>
        <Text style={styles.count}>{streak}</Text>
        <Text style={styles.unit}>Days</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.goalRow}>
          <Text style={styles.goalText}>目標: {goal}日</Text>
          <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
        </View>
        <ProgressBar progress={progress} height={12} />
      </View>
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
    marginBottom: SPACING.lg,
  },
  count: {
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
  progressContainer: {
    width: '100%',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  goalText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  percentText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.sm,
  },
});
