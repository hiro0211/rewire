import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { StreakCalendarHeader } from '@/components/history/StreakCalendarHeader';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { CalendarLegend } from '@/components/history/CalendarLegend';
import { StreakEditModal } from '@/components/dashboard/StreakEditModal';
import { useCheckinStore } from '@/stores/checkinStore';
import { useUserStore } from '@/stores/userStore';
import { SPACING } from '@/constants/theme';

export default function HistoryScreen() {
  const router = useRouter();
  const loadCheckins = useCheckinStore((state) => state.loadCheckins);
  const { user, updateUser } = useUserStore();
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    loadCheckins();
  }, [loadCheckins]);

  const handleSaveStreakStart = useCallback(
    (date: string) => {
      updateUser({ streakStartDate: date });
      setEditModalVisible(false);
    },
    [updateUser]
  );

  const initialDate = user?.streakStartDate ?? new Date().toISOString().split('T')[0];

  return (
    <SafeAreaWrapper>
      <StreakCalendarHeader
        onBack={() => router.back()}
        onEdit={() => setEditModalVisible(true)}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard>
          <HistoryCalendar />
        </GlassCard>
        <View style={styles.legendWrapper}>
          <CalendarLegend />
        </View>
      </ScrollView>

      <StreakEditModal
        visible={editModalVisible}
        initialDate={initialDate}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveStreakStart}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  legendWrapper: {
    marginTop: SPACING.md,
  },
});
