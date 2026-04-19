import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { GradientCard } from '@/components/ui/GradientCard';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { HistoryList } from '@/components/history/HistoryList';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useCheckinStore } from '@/stores/checkinStore';

export default function HistoryScreen() {
  const [viewIndex, setViewIndex] = useState(0);
  const loadCheckins = useCheckinStore((state) => state.loadCheckins);
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const viewModes = [t('historyView.calendar'), t('historyView.list')];

  useEffect(() => {
    loadCheckins();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t('nav.recordHistory'),
          headerBackTitle: t('common.back'),
          headerLeft: () => (
            <TouchableOpacity
              testID="history-back-button"
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.segmentContainer}>
        <SegmentedControl
          segments={viewModes}
          selectedIndex={viewIndex}
          onChange={setViewIndex}
        />
      </View>

      <View style={styles.content}>
        <GradientCard style={styles.calendarCard}>
          {viewIndex === 0 ? <HistoryCalendar /> : <HistoryList />}
        </GradientCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  calendarCard: {
    flex: 1,
  },
});
