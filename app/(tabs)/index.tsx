import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { StarryOverlay } from '@/components/ui/StarryOverlay';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { SOSButton } from '@/components/dashboard/SOSButton';
import { QuickActionRow } from '@/components/dashboard/QuickActionRow';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { useShareWidget } from '@/hooks/dashboard/useShareWidget';
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

let ViewShot: any = View; // fallback to plain View in Expo Go
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
        <StatsRow
          onShare={share}
          viewShotRef={viewShotRef}
          ViewShotComponent={ViewShot}
        />

        <QuickActionRow />

        <View style={styles.panicButtonContainer}>
          <SOSButton />
        </View>
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
    paddingBottom: 100, // extra padding for floating tab bar
  },
  panicButtonContainer: {
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.xxxl,
  },
});
