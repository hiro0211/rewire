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
import { FONT_WEIGHT, FONT_SIZE, SPACING } from '@/constants/theme';

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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
  streakSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  streakLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: FONT_WEIGHT.extrabold,
    lineHeight: 72,
  },
  streakUnit: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
});
