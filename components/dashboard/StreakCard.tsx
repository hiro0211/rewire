import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { useUserStore } from '@/stores/userStore';
import { StreakEditModal } from './StreakEditModal';

export function StreakCard() {
  const { streak, goal, progress, streakStartDate } = useStreak();
  const { updateUser } = useUserStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const { colors } = useTheme();
  const { t } = useLocale();

  const handleSave = (date: string) => {
    updateUser({ streakStartDate: date });
  };

  return (
    <Card style={[styles.container, { borderColor: 'rgba(0, 212, 255, 0.15)' }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('streak.currentStreak')}</Text>
      <View style={styles.row}>
        <Text style={[styles.count, { color: colors.text }]}>{streak}</Text>
        <Text style={[styles.unit, { color: colors.textSecondary }]}>Days</Text>
        <TouchableOpacity
          testID="streak-edit-button"
          onPress={() => setEditModalVisible(true)}
          style={styles.editButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Mini stats row */}
      <View testID="streak-stats-row" style={[styles.statsRow, { backgroundColor: colors.surfaceHighlight }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('streak.consecutiveDays')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{goal}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('streak.goal')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.cyan }]}>
            {Math.round(progress * 100)}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('streak.progress')}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.goalRow}>
          <Text style={[styles.goalText, { color: colors.textSecondary }]}>{t('streak.goalLabel', { days: goal })}</Text>
          <Text style={[styles.percentText, { color: colors.primary }]}>{Math.round(progress * 100)}%</Text>
        </View>
        <ProgressBar progress={progress} variant="gradient" />
      </View>

      <StreakEditModal
        visible={editModalVisible}
        initialDate={streakStartDate || new Date().toISOString().split('T')[0]}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSave}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderWidth: 1,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.lg,
  },
  count: {
    fontSize: FONT_SIZE.display,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
    lineHeight: FONT_SIZE.display * 1.1,
  },
  unit: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
  },
  editButton: {
    marginLeft: SPACING.sm,
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
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
    fontSize: FONT_SIZE.sm,
  },
  percentText: {
    fontWeight: 'bold',
    fontSize: FONT_SIZE.sm,
  },
});
