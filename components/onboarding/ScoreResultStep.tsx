import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { getScoreLevel } from '@/lib/assessment/scoreCalculator';
import { MAX_SCORE } from '@/constants/assessment';
import { HabitScoreBar } from '@/components/assessment/HabitScoreBar';

interface ScoreResultStepProps {
  score: number;
  maxScore: number;
}

export function ScoreResultStep({ score, maxScore }: ScoreResultStepProps) {
  const scoreLevel = getScoreLevel(score);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>あなたの習慣スコア</Text>

      <Text style={[styles.score, { color: scoreLevel.color }]}>
        {score} / {maxScore}
      </Text>

      <View style={styles.barWrapper}>
        <HabitScoreBar score={score} maxScore={maxScore} animated />
      </View>

      <Text style={[styles.levelLabel, { color: scoreLevel.color }]}>
        {scoreLevel.label}
      </Text>

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
    fontSize: FONT_SIZE.display,
    fontWeight: 'bold',
    marginBottom: SPACING.xxl,
  },
  barWrapper: {
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  levelLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
