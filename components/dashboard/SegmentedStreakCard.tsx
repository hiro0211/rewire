import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, FONT_WEIGHT, } from '@/constants/theme';

interface SegmentedStreakCardProps {
  elapsed: string;
  relapseCount: number;
  goalDays: number;
}

export function SegmentedStreakCard({ elapsed, relapseCount, goalDays }: SegmentedStreakCardProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View testID="segmented-streak-card" style={styles.row}>
      <GlassCard style={styles.segment}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t('dashboard.relapses')}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {relapseCount}
        </Text>
      </GlassCard>

      <GlassCard style={styles.segment} borderColor={colors.cyan}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t('dashboard.elapsed')}
        </Text>
        <Text
          style={[styles.value, { color: colors.cyan }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {elapsed}
        </Text>
      </GlassCard>

      <GlassCard style={styles.segment}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t('streak.goal')}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {goalDays}
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  value: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
});
