import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { SegmentedStreakCard } from '@/components/dashboard/SegmentedStreakCard';
import { ShareWidgetCard } from '@/components/dashboard/ShareWidgetCard';
import { BrainRewiringBar } from '@/components/dashboard/BrainRewiringBar';
import { QuickActionGrid } from '@/components/dashboard/QuickActionGrid';
import { SOSButton } from '@/components/dashboard/SOSButton';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useShareWidget } from '@/hooks/dashboard/useShareWidget';
import { useEntranceAnimation } from '@/hooks/ui/useEntranceAnimation';
import { calculateRewiringProgress } from '@/lib/dashboard/rewiringProgress';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
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
  const { colors } = useTheme();
  const { t } = useLocale();
  const { viewShotRef, share } = useShareWidget();
  const { stopwatch, goalDays, relapseCount } = useDashboardStats();
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

  const handleShare = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    share();
  }, [share]);

  // Entrance animations with stagger
  const orbAnim = useEntranceAnimation({ delay: 0 });
  const streakCardAnim = useEntranceAnimation({ delay: 100 });
  const rewiringBarAnim = useEntranceAnimation({ delay: 200 });
  const quickActionAnim = useEntranceAnimation({ delay: 300 });
  const sosAnim = useEntranceAnimation({ delay: 400 });

  return (
    <SafeAreaWrapper>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: SPACING.xxxl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.cyan}
          />
        }
      >
        <Animated.View style={orbAnim.animatedStyle}>
          <StatsRow />
        </Animated.View>

        <Animated.View style={streakCardAnim.animatedStyle}>
          <SegmentedStreakCard
            elapsed={stopwatch.formatted}
            streakDays={streakDays}
            goalDays={goalDays}
          />
        </Animated.View>

        <TouchableOpacity
          testID="share-button"
          onPress={handleShare}
          style={styles.shareButton}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.shareText, { color: colors.textSecondary }]}>
            {t('dashboard.share')}
          </Text>
        </TouchableOpacity>

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

      {/* Off-screen: share widget card capture */}
      <View style={styles.offScreen} pointerEvents="none">
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <ShareWidgetCard
            testID="share-capture-area"
            elapsed={stopwatch.formatted}
            relapseCount={relapseCount}
            goalDays={goalDays}
          />
        </ViewShot>
      </View>

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
    </SafeAreaWrapper>
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
  offScreen: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  shareButton: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  shareText: {
    fontSize: FONT_SIZE.xs,
  },
});
