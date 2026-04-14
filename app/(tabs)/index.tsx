import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, StatusBar } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { StarryOverlay } from '@/components/ui/StarryOverlay';
import { DayChip } from '@/components/dashboard/DayChip';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { SegmentedStreakCard } from '@/components/dashboard/SegmentedStreakCard';
import { BrainRewiringBar } from '@/components/dashboard/BrainRewiringBar';
import { QuickActionGrid } from '@/components/dashboard/QuickActionGrid';
import { SOSButton } from '@/components/dashboard/SOSButton';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useShareWidget } from '@/hooks/dashboard/useShareWidget';
import { useEntranceAnimation } from '@/hooks/ui/useEntranceAnimation';
import { calculateRewiringProgress } from '@/lib/dashboard/rewiringProgress';
import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useFocusEffect } from 'expo-router';
import { isExpoGo } from '@/lib/nativeGuard';
import { useSurveyEligibility } from '@/hooks/survey/useSurveyEligibility';
import { useSurveyPromptActions } from '@/hooks/survey/useSurveyPromptActions';
import { SurveyPromptModal } from '@/components/survey/SurveyPromptModal';
import { useReviewEligibility } from '@/hooks/review/useReviewEligibility';
import { useReviewPromptActions } from '@/hooks/review/useReviewPromptActions';
import { ReviewPromptModal } from '@/components/review/ReviewPromptModal';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

let ViewShot: any = View;
if (!isExpoGo) {
  try {
    ViewShot = require('react-native-view-shot').default;
  } catch {
    // Native module not available
  }
}

export default function DashboardScreen() {
  const { loadUser } = useUserStore();
  const { loadCheckins } = useCheckinStore();
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDark } = useTheme();
  const { viewShotRef, share } = useShareWidget();
  const insets = useSafeAreaInsets();
  const { stopwatch, goalDays } = useDashboardStats();
  const { shouldShowSurvey } = useSurveyEligibility();
  const [surveyModalVisible, setSurveyModalVisible] = useState(false);
  const { handleAccept, handleDismiss } = useSurveyPromptActions(
    () => setSurveyModalVisible(false)
  );

  const { shouldShowReview } = useReviewEligibility();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const {
    selectedRating,
    showFeedback,
    handleRate,
    handleFeedbackTap,
    handleDismiss: handleReviewDismiss,
  } = useReviewPromptActions(() => setReviewModalVisible(false));

  useEffect(() => {
    if (shouldShowSurvey) {
      setSurveyModalVisible(true);
    } else if (shouldShowReview) {
      setReviewModalVisible(true);
      analyticsClient.logEvent('review_prompt_shown');
    }
  }, [shouldShowSurvey, shouldShowReview]);

  useFocusEffect(
    useCallback(() => {
      loadCheckins();
      loadUser();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadCheckins(), loadUser()]);
    setRefreshing(false);
  }, [loadCheckins, loadUser]);

  const streakDays = stopwatch.days ?? 0;
  const rewiringProgress = calculateRewiringProgress(streakDays, goalDays);

  // Entrance animations with stagger
  const dayChipAnim = useEntranceAnimation({ delay: 0 });
  const orbAnim = useEntranceAnimation({ delay: 100 });
  const streakCardAnim = useEntranceAnimation({ delay: 200 });
  const rewiringBarAnim = useEntranceAnimation({ delay: 300 });
  const quickActionAnim = useEntranceAnimation({ delay: 400 });
  const sosAnim = useEntranceAnimation({ delay: 500 });

  return (
    <AuroraBackground>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" />
      <StarryOverlay />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.cyan}
          />
        }
      >
        <Animated.View style={dayChipAnim.animatedStyle}>
          <DayChip day={streakDays} />
        </Animated.View>

        <Animated.View style={orbAnim.animatedStyle}>
          <StatsRow
            onShare={share}
            viewShotRef={viewShotRef}
            ViewShotComponent={ViewShot}
          />
        </Animated.View>

        <Animated.View style={streakCardAnim.animatedStyle}>
          <SegmentedStreakCard
            elapsed={stopwatch.formatted}
            streakDays={streakDays}
            goalDays={goalDays}
          />
        </Animated.View>

        <Animated.View style={[rewiringBarAnim.animatedStyle, styles.section]}>
          <BrainRewiringBar progress={rewiringProgress} />
        </Animated.View>

        <Animated.View style={quickActionAnim.animatedStyle}>
          <QuickActionGrid />
        </Animated.View>

        <Animated.View style={[sosAnim.animatedStyle, styles.sosSection]}>
          <SOSButton />
        </Animated.View>

      </ScrollView>

      <SurveyPromptModal
        visible={surveyModalVisible}
        onAccept={handleAccept}
        onDismiss={handleDismiss}
      />

      <ReviewPromptModal
        visible={reviewModalVisible}
        selectedRating={selectedRating}
        showFeedback={showFeedback}
        onRate={handleRate}
        onFeedbackTap={handleFeedbackTap}
        onDismiss={handleReviewDismiss}
      />
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  section: {
    marginTop: SPACING.md,
  },
  sosSection: {
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.xxxl,
  },
});
