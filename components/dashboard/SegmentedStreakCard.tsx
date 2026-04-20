import React, { useEffect, useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '@/constants/theme';

interface SegmentedStreakCardProps {
  elapsed: string;
  relapseCount: number;
  goalDays: number;
  todayReflectionCompleted?: boolean;
}

export function SegmentedStreakCard({
  elapsed,
  relapseCount,
  goalDays,
  todayReflectionCompleted,
}: SegmentedStreakCardProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const prevCompletedRef = useRef<boolean | undefined>(todayReflectionCompleted);

  useEffect(() => {
    if (
      prevCompletedRef.current === false &&
      todayReflectionCompleted === true
    ) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    prevCompletedRef.current = todayReflectionCompleted;
  }, [todayReflectionCompleted]);

  return (
    <View testID="segmented-streak-card">
      <View style={styles.row}>
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

      {todayReflectionCompleted === false && (
        <View
          testID="reflection-pending-badge"
          style={[
            styles.pendingBadge,
            {
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              borderColor: 'rgba(139, 92, 246, 0.32)',
            },
          ]}
        >
          <Text style={[styles.pendingText, { color: colors.text }]}>
            ✨ {t('dashboard.reflectionPending')}
          </Text>
        </View>
      )}
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
  pendingBadge: {
    alignSelf: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  pendingText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
