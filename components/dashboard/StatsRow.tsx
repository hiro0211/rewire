import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { GradientCard } from '@/components/ui/GradientCard';
import { GlowDivider } from '@/components/ui/GlowDivider';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useUserStore } from '@/stores/userStore';
import { StreakEditModal } from './StreakEditModal';
import { format, parseISO } from 'date-fns';

function formatStartDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return format(date, 'yyyy/MM/dd') + ' から';
  } catch {
    return '';
  }
}

export function StatsRow() {
  const { relapseCount, stopwatch, goalDays, streakStartDate } = useDashboardStats();
  const { updateUser } = useUserStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const { colors, glow } = useTheme();

  const handleSave = (date: string) => {
    updateUser({ streakStartDate: date });
  };

  return (
    <View testID="stats-row" style={styles.wrapper}>
      <GradientCard variant="hero" testID="stat-stopwatch">
        <TouchableOpacity
          testID="hero-card-touch"
          onLongPress={() => setEditModalVisible(true)}
          activeOpacity={0.7}
          style={styles.heroInner}
        >
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>現在の記録</Text>
          <Text
            style={[styles.heroValue, { color: colors.cyan }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {stopwatch.formatted}
          </Text>
          {streakStartDate ? (
            <Text style={[styles.heroSince, { color: colors.textSecondary }]}>{formatStartDate(streakStartDate)}</Text>
          ) : null}

          <GlowDivider />

          <View style={styles.inlineStats}>
            <View testID="stat-relapse" style={styles.inlineStat}>
              <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>リセット回数</Text>
              <Text
                style={[
                  styles.miniValue,
                  { color: relapseCount === 0 ? colors.success : colors.danger },
                ]}
              >
                {relapseCount}
              </Text>
            </View>

            <View style={[styles.inlineDivider, {
              backgroundColor: glow.purple,
              shadowColor: glow.purple,
            }]} />

            <View testID="stat-goal" style={styles.inlineStat}>
              <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>目標日数</Text>
              <Text style={[styles.miniValue, { color: colors.text }]}>{goalDays}日</Text>
            </View>
          </View>
        </TouchableOpacity>
      </GradientCard>

      <StreakEditModal
        visible={editModalVisible}
        initialDate={streakStartDate || new Date().toISOString().split('T')[0]}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.xxxl,
  },
  heroInner: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
  },
  heroValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  heroSince: {
    fontSize: FONT_SIZE.xs,
  },
  inlineStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  inlineStat: {
    flex: 1,
    alignItems: 'center',
  },
  inlineDivider: {
    width: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  miniLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
  },
  miniValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
});
