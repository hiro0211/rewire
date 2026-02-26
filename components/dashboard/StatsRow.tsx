import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
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
      {/* ヒーローカード: 現在の記録 */}
      <TouchableOpacity
        testID="stat-stopwatch"
        style={styles.heroCard}
        onLongPress={() => setEditModalVisible(true)}
        activeOpacity={0.7}
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
      </TouchableOpacity>

      {/* ミニカード行: リセット回数 + 目標日数 */}
      <View style={styles.miniRow}>
        <View testID="stat-relapse" style={styles.miniCard}>
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

        <View testID="stat-goal" style={styles.miniCard}>
          <Text style={styles.miniLabel}>目標日数</Text>
          <Text style={styles.miniValue}>{goalDays}日</Text>
        </View>
      </View>

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
    gap: SPACING.sm,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
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
  miniRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  miniCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
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
