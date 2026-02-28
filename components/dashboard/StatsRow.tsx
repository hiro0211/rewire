import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS, GLOW } from '@/constants/theme';
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
          <Text style={styles.heroLabel}>現在の記録</Text>
          <Text
            style={styles.heroValue}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {stopwatch.formatted}
          </Text>
          {streakStartDate ? (
            <Text style={styles.heroSince}>{formatStartDate(streakStartDate)}</Text>
          ) : null}

          <GlowDivider />

          <View style={styles.inlineStats}>
            <View testID="stat-relapse" style={styles.inlineStat}>
              <Text style={styles.miniLabel}>リセット回数</Text>
              <Text
                style={[
                  styles.miniValue,
                  { color: relapseCount === 0 ? COLORS.success : COLORS.danger },
                ]}
              >
                {relapseCount}
              </Text>
            </View>

            <View style={styles.inlineDivider} />

            <View testID="stat-goal" style={styles.inlineStat}>
              <Text style={styles.miniLabel}>目標日数</Text>
              <Text style={styles.miniValue}>{goalDays}日</Text>
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
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  heroValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.cyan,
    marginBottom: SPACING.sm,
  },
  heroSince: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
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
    backgroundColor: GLOW.purple,
    shadowColor: GLOW.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  miniLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  miniValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
