import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { StarryOverlay } from '@/components/ui/StarryOverlay';
import { AchievementSummaryCircle } from '@/components/achievements/AchievementSummaryCircle';
import { CosmosProgressTimeline } from '@/components/profile/CosmosProgressTimeline';
import { useAchievements } from '@/hooks/achievements/useAchievements';
export default function AchievementsScreen() {
  const { achievements, summary, streak } = useAchievements();
  const { colors } = useTheme();

  return (
    <AuroraBackground>
      <StarryOverlay />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryText}>
            <Text style={[styles.summaryCount, { color: colors.text }]}>
              {summary.unlocked}/{summary.total} Unlocked
            </Text>
          </View>
          <AchievementSummaryCircle percentage={summary.percentage} />
        </View>

        {/* Cosmos Timeline */}
        <CosmosProgressTimeline streak={streak} achievements={achievements} />
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
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
  },
});
