import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '@/constants/theme';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { HistoryList } from '@/components/history/HistoryList';
import { ToggleButton } from '@/components/ui/ToggleButton';
import { useCheckinStore } from '@/stores/checkinStore';

export default function HistoryScreen() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const loadCheckins = useCheckinStore((state) => state.loadCheckins);

  useEffect(() => {
    loadCheckins();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>記録履歴</Text>
      </View>

      <View style={styles.toggleContainer}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleButtonWrapper}>
            <ToggleButton
              title="カレンダー"
              active={viewMode === 'calendar'}
              onPress={() => setViewMode('calendar')}
            />
          </View>
          <View style={styles.toggleButtonWrapper}>
            <ToggleButton
              title="リスト"
              active={viewMode === 'list'}
              onPress={() => setViewMode('list')}
            />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {viewMode === 'calendar' ? <HistoryCalendar /> : <HistoryList />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  toggleContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleButtonWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
});
