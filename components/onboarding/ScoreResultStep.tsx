import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { getScoreLevel } from '@/lib/assessment/scoreCalculator';

interface ScoreResultStepProps {
  score: number;
  maxScore: number;
}

const AVERAGE_SCORE_RATIO = 0.45; // Average user comparison baseline

export function ScoreResultStep({ score, maxScore }: ScoreResultStepProps) {
  const scoreLevel = getScoreLevel(score);
  const yourRatio = Math.min(score / maxScore, 1);
  const averageRatio = AVERAGE_SCORE_RATIO;
  const MAX_BAR_HEIGHT = 160;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>分析完了</Text>

      <Text style={[styles.levelLabel, { color: scoreLevel.color }]}>
        {scoreLevel.label}
      </Text>

      <Text style={[styles.score, { color: scoreLevel.color }]}>
        {score} / {maxScore}
      </Text>

      {/* Bar comparison chart */}
      <View style={styles.chartContainer}>
        <View style={styles.barColumn}>
          <View
            testID="score-bar-yours"
            style={[
              styles.bar,
              {
                height: Math.max(yourRatio * MAX_BAR_HEIGHT, 20),
                backgroundColor: scoreLevel.color,
              },
            ]}
          />
          <Text style={styles.barLabel}>あなた</Text>
        </View>
        <View style={styles.barColumn}>
          <View
            testID="score-bar-average"
            style={[
              styles.bar,
              {
                height: Math.max(averageRatio * MAX_BAR_HEIGHT, 20),
                backgroundColor: COLORS.textSecondary,
              },
            ]}
          />
          <Text style={styles.barLabel}>平均</Text>
        </View>
      </View>

      <Text style={styles.message}>{scoreLevel.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  score: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xxl,
  },
  levelLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 40,
    marginBottom: SPACING.xxl,
    height: 200,
  },
  barColumn: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bar: {
    width: 48,
    borderRadius: RADIUS.sm,
  },
  barLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  message: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
