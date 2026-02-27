import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { AchievementSummaryCircle } from '@/components/achievements/AchievementSummaryCircle';
import { AchievementTimelineItem } from '@/components/achievements/AchievementTimelineItem';
import { useAchievements } from '@/hooks/achievements/useAchievements';

export default function AchievementsScreen() {
  const { achievements, summary } = useAchievements();

  return (
    <View style={styles.container}>
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
        {achievements.map(({ badge, isUnlocked }, index) => (
          <AchievementTimelineItem
            key={badge.id}
            badge={badge}
            isUnlocked={isUnlocked}
            position={index % 2 === 0 ? 'left' : 'right'}
            isLast={index === achievements.length - 1}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.lg,
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
