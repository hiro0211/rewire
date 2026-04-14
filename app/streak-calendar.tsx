import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { StarryOverlay } from '@/components/ui/StarryOverlay';
import { GradientCard } from '@/components/ui/GradientCard';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { useTheme } from '@/hooks/useTheme';

export default function StreakCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { streak } = useStreak();
  const { colors } = useTheme();

  return (
    <AuroraBackground>
      <StarryOverlay />
      <View
        style={[styles.container, { paddingTop: insets.top }]}
        testID="streak-calendar-screen"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            testID="back-button"
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Streak Calendar</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.streakSection}>
          <Text style={[styles.streakLabel, { color: colors.cyan }]}>CURRENT STREAK</Text>
          <Text style={[styles.streakNumber, { color: colors.text }]}>{streak}</Text>
          <Text style={[styles.streakUnit, { color: colors.textSecondary }]}>DAYS</Text>
        </View>

        <View style={styles.calendarContainer}>
          <GradientCard>
            <HistoryCalendar />
          </GradientCard>
        </View>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  streakSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 72,
  },
  streakUnit: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
