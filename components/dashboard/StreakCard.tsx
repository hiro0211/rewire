import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { useUserStore } from '@/stores/userStore';
import { StreakEditModal } from './StreakEditModal';

export function StreakCard() {
  const { streak, goal, progress, streakStartDate } = useStreak();
  const { updateUser } = useUserStore();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleSave = (date: string) => {
    updateUser({ streakStartDate: date });
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.label}>現在の記録</Text>
      <View style={styles.row}>
        <Text style={styles.count}>{streak}</Text>
        <Text style={styles.unit}>Days</Text>
        <TouchableOpacity
          testID="streak-edit-button"
          onPress={() => setEditModalVisible(true)}
          style={styles.editButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="pencil-outline" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Mini stats row */}
      <View testID="streak-stats-row" style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>連続日数</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{goal}</Text>
          <Text style={styles.statLabel}>目標</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.cyan }]}>
            {Math.round(progress * 100)}%
          </Text>
          <Text style={styles.statLabel}>達成率</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.goalRow}>
          <Text style={styles.goalText}>目標: {goal}日</Text>
          <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
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
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.lg,
  },
  count: {
    color: COLORS.text,
    fontSize: FONT_SIZE.display,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
    lineHeight: FONT_SIZE.display * 1.1,
  },
  unit: {
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  percentText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.sm,
  },
});
