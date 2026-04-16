import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '@/constants/theme';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useUserStore } from '@/stores/userStore';
import { OrbCarousel } from './OrbCarousel';
import { StreakEditModal } from './StreakEditModal';

export function StatsRow() {
  const { stopwatch, streakStartDate } = useDashboardStats();
  const { updateUser } = useUserStore();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const streakDays = stopwatch.days ?? 0;

  const openEdit = useCallback(() => setEditModalVisible(true), []);
  const closeEdit = useCallback(() => setEditModalVisible(false), []);
  const handleSave = useCallback(
    (date: string) => {
      updateUser({ streakStartDate: date });
    },
    [updateUser]
  );

  return (
    <View testID="stats-row" style={styles.wrapper}>
      <View style={styles.orbSection}>
        <OrbCarousel currentDays={streakDays} onLongPress={openEdit} />
      </View>

      <StreakEditModal
        visible={editModalVisible}
        initialDate={streakStartDate || new Date().toISOString().split('T')[0]}
        onClose={closeEdit}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.xxxl,
  },
  orbSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
});
