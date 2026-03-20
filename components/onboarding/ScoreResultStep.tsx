import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
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
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('scoreResult.analysisComplete')}</Text>

      <Text style={[styles.levelLabel, { color: scoreLevel.color }]}>
        {t(scoreLevel.labelKey)}
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
          <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{t('scoreResult.you')}</Text>
        </View>
        <View style={styles.barColumn}>
          <View
            testID="score-bar-average"
            style={[
              styles.bar,
              {
                height: Math.max(averageRatio * MAX_BAR_HEIGHT, 20),
                backgroundColor: colors.textSecondary,
              },
            ]}
          />
          <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{t('scoreResult.average')}</Text>
        </View>
      </View>

      <Text style={[styles.message, { color: colors.textSecondary }]}>{t(scoreLevel.messageKey)}</Text>
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
  },
  message: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
  },
});
