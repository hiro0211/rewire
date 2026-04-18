import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, FONT_SIZE, FONT_WEIGHT, } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { StarryOverlay } from '@/components/ui/StarryOverlay';
import { AchievementSummaryCircle } from '@/components/achievements/AchievementSummaryCircle';
import { AchievementsHeader } from '@/components/achievements/AchievementsHeader';
import { StellarPathTimeline } from '@/components/achievements/StellarPathTimeline';
import { useAchievements } from '@/hooks/achievements/useAchievements';

export default function AchievementsScreen() {
  const { achievements, summary, streak } = useAchievements();
  const { colors } = useTheme();
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  return (
    <AuroraBackground>
      <StarryOverlay />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AchievementsHeader onClose={handleClose} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryText}>
              <Text style={[styles.summaryCount, { color: colors.text }]}>
                {summary.unlocked}/{summary.total} Unlocked
              </Text>
            </View>
            <AchievementSummaryCircle percentage={summary.percentage} />
          </View>

          <StellarPathTimeline streak={streak} achievements={achievements} />
        </ScrollView>
      </SafeAreaView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
    fontWeight: FONT_WEIGHT.semibold,
  },
});
