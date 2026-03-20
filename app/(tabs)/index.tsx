import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { SOSButton } from '@/components/dashboard/SOSButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { useShareWidget } from '@/hooks/dashboard/useShareWidget';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';
import { useRouter, useFocusEffect } from 'expo-router';
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
  const { user, loadUser } = useUserStore();
  const { loadCheckins, todayCheckin } = useCheckinStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const { t } = useLocale();
  const { viewShotRef, share } = useShareWidget();
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
    <SafeAreaWrapper style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.cyan}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{t('dashboard.greeting')}</Text>
          <Text style={[styles.username, { color: colors.text }]}>{user?.nickname}</Text>
        </View>

        <StatsRow
          onShare={share}
          viewShotRef={viewShotRef}
          ViewShotComponent={ViewShot}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard.todayReview')}</Text>
          {todayCheckin ? (
            <GradientCard>
              <View style={styles.doneInner}>
                <Text style={[styles.doneText, { color: colors.success }]}>{t('dashboard.completed')}</Text>
                <Text style={[styles.doneSubText, { color: colors.textSecondary }]}>{t('dashboard.continueMessage')}</Text>
                <TouchableOpacity onPress={() => router.push('/checkin')} style={styles.redoButton}>
                  <Text style={[styles.redoText, { color: colors.textSecondary }]}>{t('dashboard.redo')}</Text>
                </TouchableOpacity>
              </View>
            </GradientCard>
          ) : (
            <Button
              title={t('dashboard.enterResult')}
              onPress={() => router.push('/checkin')}
              variant="gradient"
              style={styles.checkinButton}
            />
          )}
        </View>

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
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZE.sm,
  },
  username: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SPACING.xxxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  checkinButton: {
    marginTop: SPACING.xs,
  },
  doneInner: {
    alignItems: 'center',
  },
  doneText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doneSubText: {
    fontSize: FONT_SIZE.sm,
  },
  redoButton: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  redoText: {
    fontSize: FONT_SIZE.xs,
    textDecorationLine: 'underline',
  },
  panicButtonContainer: {
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.xxxl,
  },
});
