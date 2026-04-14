import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE } from '@/constants/theme';

interface SegmentedStreakCardProps {
  elapsed: string;
  streakDays: number;
  goalDays: number;
}

export function SegmentedStreakCard({ elapsed, streakDays, goalDays }: SegmentedStreakCardProps) {
  const { colors, glow } = useTheme();
  const { t } = useLocale();

  return (
    <GlassCard testID="segmented-streak-card">
      <View style={styles.row}>
        <View style={styles.segment}>
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
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: glow.purple, shadowColor: glow.purple },
          ]}
        />

        <View style={styles.segment}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('streak.consecutiveDays')}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {streakDays}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: glow.purple, shadowColor: glow.purple },
          ]}
        />

        <View style={styles.segment}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('streak.goal')}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {goalDays}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 32,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
});
