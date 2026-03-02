import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { GradientCard } from '@/components/ui/GradientCard';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { HistoryList } from '@/components/history/HistoryList';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useCheckinStore } from '@/stores/checkinStore';

const VIEW_MODES = ['カレンダー', 'リスト'] as const;

export default function HistoryScreen() {
  const [viewIndex, setViewIndex] = useState(0);
  const loadCheckins = useCheckinStore((state) => state.loadCheckins);
  const { colors } = useTheme();

  useEffect(() => {
    loadCheckins();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.segmentContainer}>
        <SegmentedControl
          segments={[...VIEW_MODES]}
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
