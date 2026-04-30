import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { SegmentedStreakCard } from '@/components/dashboard/SegmentedStreakCard';
import { ShareWidgetCard } from '@/components/dashboard/ShareWidgetCard';
import { QuickActionGrid } from '@/components/dashboard/QuickActionGrid';
import { SOSButton } from '@/components/dashboard/SOSButton';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useShareWidget } from '@/hooks/dashboard/useShareWidget';
import { useEntranceAnimation } from '@/hooks/ui/useEntranceAnimation';
import Ionicons from '@expo/vector-icons/Ionicons';
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
import { ReflectionSheet } from '@/components/reflection/ReflectionSheet';
import { useReflectionTrigger } from '@/hooks/reflection/useReflectionTrigger';
import { useAutoOpenReflectionSheet } from '@/hooks/reflection/useAutoOpenReflectionSheet';
import { useReflectionSheet } from '@/hooks/reflection/useReflectionSheet';
import { useStreakCelebration } from '@/hooks/streak/useStreakCelebration';
import { StreakCountUpModal } from '@/components/streak/StreakCountUpModal';

let ViewShot: any = View;
if (!isExpoGo) {
  try {
    ViewShot = require('react-native-view-shot').default;
  } catch {
    // Native module not available
  }
}

// Tab bar dimensions from BlurTabBar (pill padding 8+8 + tab paddingVertical 6+6 + icon ~22 ≈ 50px)
// + margin 4 above safe-area bottom + gap 3 between tab bar and SOS button
const TAB_BAR_HEIGHT = 50;
const TAB_BAR_MARGIN = 4;
const SOS_GAP_ABOVE_TAB_BAR = 3;
const TAB_BAR_OFFSET = TAB_BAR_MARGIN + TAB_BAR_HEIGHT + SOS_GAP_ABOVE_TAB_BAR;
// Total vertical space reserved below scroll content so nothing is hidden by the floating SOS button
const SOS_BUTTON_HEIGHT = 56;
const SCROLL_BOTTOM_PADDING = TAB_BAR_OFFSET + SOS_BUTTON_HEIGHT + 24;

export default function DashboardScreen() {
  const { loadUser } = useUserStore();
  const { loadCheckins } = useCheckinStore();
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const { t } = useLocale();
  const { viewShotRef, share } = useShareWidget();
  const { stopwatch, goalDays, relapseCount } = useDashboardStats();
  const insets = useSafeAreaInsets();
  const { shouldShowSurvey } = useSurveyEligibility();
  const [surveyModalVisible, setSurveyModalVisible] = useState(false);
  const { handleAccept, handleDismiss } = useSurveyPromptActions(
    () => setSurveyModalVisible(false)
  );

  const { shouldShowReview } = useReviewEligibility();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  useReflectionTrigger();
  useAutoOpenReflectionSheet();

  const { celebratingStreak, fromStreak, trigger, dismiss } = useStreakCelebration();
  const reflectionSheetVisible = useReflectionSheet((s) => s.visible);
  const pendingCelebrationStreak = useReflectionSheet((s) => s.pendingCelebrationStreak);
  const clearPendingCelebration = useReflectionSheet((s) => s.clearPendingCelebration);

  // Consume pending celebration once the reflection sheet is closed.
  useEffect(() => {
    if (!reflectionSheetVisible && pendingCelebrationStreak !== null) {
      trigger(pendingCelebrationStreak);
      clearPendingCelebration();
    }
  }, [reflectionSheetVisible, pendingCelebrationStreak, trigger, clearPendingCelebration]);

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

  const handleShare = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    share();
  }, [share]);

  // Entrance animations with stagger
  const orbAnim = useEntranceAnimation({ delay: 0 });
  const streakCardAnim = useEntranceAnimation({ delay: 100 });
  const quickActionAnim = useEntranceAnimation({ delay: 200 });
  const sosAnim = useEntranceAnimation({ delay: 300 });

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
            relapseCount={relapseCount}
            goalDays={goalDays}
          />
        </Animated.View>

        {/* <TouchableOpacity
          testID="share-button"
          onPress={handleShare}
          style={styles.shareButton}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.shareText, { color: colors.textSecondary }]}>
            {t('dashboard.share')}
          </Text>
        </TouchableOpacity> */}

        <Animated.View style={quickActionAnim.animatedStyle}>
          <QuickActionGrid />
        </Animated.View>

      </ScrollView>

      {/* Floating SOS button — fixed above the tab bar */}
      <View
        testID="sos-floating-container"
        pointerEvents="box-none"
        style={[
          styles.sosFloatingContainer,
          { bottom: insets.bottom + TAB_BAR_OFFSET },
        ]}
      >
        <Animated.View style={sosAnim.animatedStyle}>
          <SOSButton />
        </Animated.View>
      </View>

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

      <ReflectionSheet />

      <StreakCountUpModal
        visible={celebratingStreak !== null}
        fromStreak={fromStreak}
        toStreak={celebratingStreak ?? 0}
        onDismiss={dismiss}
      />

    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SCROLL_BOTTOM_PADDING,
  },
  sosFloatingContainer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
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
