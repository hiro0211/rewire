import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { AchievementSummaryCircle } from '@/components/achievements/AchievementSummaryCircle';
import { AchievementTimelineItem } from '@/components/achievements/AchievementTimelineItem';
import { useAchievements } from '@/hooks/achievements/useAchievements';

export default function AchievementsScreen() {
  const router = useRouter();
  const { achievements, summary } = useAchievements();

  // Reverse order: highest milestone at top
  const reversed = [...achievements].reverse();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()} hitSlop={12}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Achievements</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryText}>
          <Text style={styles.summaryCount}>
            {summary.unlocked}/{summary.total} Unlocked
          </Text>
        </View>
        <AchievementSummaryCircle percentage={summary.percentage} />
      </View>

      {/* Timeline */}
      <ScrollView contentContainerStyle={styles.timeline}>
        {reversed.map(({ badge, isUnlocked }, index) => (
          <AchievementTimelineItem
            key={badge.id}
            badge={badge}
            isUnlocked={isUnlocked}
            position={index % 2 === 0 ? 'left' : 'right'}
            isLast={index === reversed.length - 1}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    width: 28,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.lg,
  },
  summaryText: {
    flex: 1,
  },
  summaryCount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeline: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
});
