import React, { useRef } from 'react';
import { View, StyleSheet, Animated, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StarryBackground } from '@/components/onboarding/StarryBackground';
import { OnboardingStepRenderer } from '@/components/onboarding/OnboardingStepRenderer';
import { canAdvanceStep } from '@/lib/onboarding/canAdvanceStep';
import type { OnboardingFormState } from '@/lib/onboarding/canAdvanceStep';
import { format } from 'date-fns';
import { useOnboardingForm } from '@/hooks/onboarding/useOnboardingForm';
import { useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingNavigation';
import { useOnboardingAnimation } from '@/hooks/onboarding/useOnboardingAnimation';
import {
  STEPS,
  NO_FOOTER_TYPES,
  NON_COUNTABLE_TYPES,
  FEATURES_STEP_INDEX,
  EDUCATION_START_INDEX,
  STEP_COUNTER_MAP,
  TOTAL_COUNTABLE_STEPS,
  canGoBack,
  isEducationStep,
  isAssessmentStep,
} from '@/constants/onboarding';

export default function OnboardingScreen() {
  const form = useOnboardingForm();
  const nav = useOnboardingNavigation();
  const router = useRouter();
  const autoAdvancingRef = useRef(false);
  const { colors } = useTheme();
  const { t } = useLocale();

  const stateRef = useRef<OnboardingFormState>({
    step: nav.step,
    nickname: form.nickname,
    privacyAgreed: form.privacyAgreed,
    dataAgreed: form.dataAgreed,
    answers: form.answers,
    lastViewedYear: form.lastViewedYear,
    lastViewedMonth: form.lastViewedMonth,
    lastViewedDay: form.lastViewedDay,
  });
  stateRef.current = {
    step: nav.step,
    nickname: form.nickname,
    privacyAgreed: form.privacyAgreed,
    dataAgreed: form.dataAgreed,
    answers: form.answers,
    lastViewedYear: form.lastViewedYear,
    lastViewedMonth: form.lastViewedMonth,
    lastViewedDay: form.lastViewedDay,
  };

  const canAdvanceAt = (s: number) => canAdvanceStep(s, stateRef.current);

  const { translateX, animateTransition, panResponder } = useOnboardingAnimation({
    stateRef,
    canAdvanceAt,
    goToStep: nav.goToStep,
    autoAdvancingRef,
  });

  const handleNext = () => {
    if (nav.step < STEPS.length - 1) {
      if (!canAdvanceAt(nav.step)) return;
      animateTransition(-1, () => nav.goToNextStep());
    } else {
      const lastViewedDate = format(
        new Date(form.lastViewedYear, form.lastViewedMonth - 1, form.lastViewedDay),
        'yyyy-MM-dd'
      );
      router.push({
        pathname: '/onboarding/goal',
        params: {
          nickname: form.nickname,
          consentGivenAt: new Date().toISOString(),
          notifyTime: form.notifyTime,
          lastViewedDate,
          selectedSymptoms: JSON.stringify(form.selectedSymptoms),
        },
      });
    }
  };

  const handleBack = () => {
    if (canGoBack(nav.step)) {
      animateTransition(1, () => nav.goToPreviousStep());
    }
  };

  const handleAssessmentAnswer = (questionId: string, value: string) => {
    if (autoAdvancingRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    form.setAnswer(questionId, value);
    autoAdvancingRef.current = true;
    setTimeout(() => {
      animateTransition(-1, () => {
        nav.goToStep(nav.step + 1);
        autoAdvancingRef.current = false;
      });
    }, 300);
  };

  const handlePickerSelect = (questionId: string, value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    form.setAnswer(questionId, value);
  };

  const handleAutoAdvance = () => {
    animateTransition(-1, () => nav.goToNextStep());
  };

  const currentStep = nav.currentStep;
  const showFooter = !NO_FOOTER_TYPES.has(currentStep.type);
  const isNextDisabled = !canAdvanceAt(nav.step);
  const showSkip = isEducationStep(currentStep) || isAssessmentStep(currentStep);
  const skipTarget = isAssessmentStep(currentStep) ? EDUCATION_START_INDEX : FEATURES_STEP_INDEX;
  const footerButtonTitle = currentStep.type === 'score_result' ? t('checkin.checkSymptoms') : t('common.next');

  const backgroundConfig = currentStep.type === 'damage_intro'
    ? { gradientColors: ['#0A0A0F', '#1a1a3e', '#2d1b4e'] as string[], showStars: false }
    : {};

  return (
    <StarryBackground {...backgroundConfig}>
      <SafeAreaWrapper style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {canGoBack(nav.step) ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={styles.backButtonCircle}>
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.backButtonPlaceholder} />
            )}
            {showSkip ? (
              <TouchableOpacity
                onPress={() => animateTransition(-1, () => nav.goToStep(skipTarget))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>{t('common.skip')}</Text>
              </TouchableOpacity>
            ) : !NON_COUNTABLE_TYPES.has(currentStep.type) ? (
              <Text style={[styles.stepCounter, { color: colors.textSecondary }]}>
                {`${STEP_COUNTER_MAP[nav.step]}/${TOTAL_COUNTABLE_STEPS}`}
              </Text>
            ) : (
              <View style={styles.backButtonPlaceholder} />
            )}
          </View>
          <ProgressBar progress={nav.progress} height={4} variant="gradient" />
        </View>

        <Animated.View
          style={[styles.content, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.fullWidth}>
            <OnboardingStepRenderer
              currentStep={currentStep}
              form={form}
              onAssessmentAnswer={handleAssessmentAnswer}
              onPickerSelect={handlePickerSelect}
              onAutoAdvance={handleAutoAdvance}
            />
          </View>
        </Animated.View>

        {showFooter && (
          <View style={styles.footer}>
            <Button title={footerButtonTitle} onPress={handleNext} disabled={isNextDisabled} />
          </View>
        )}
      </SafeAreaWrapper>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    minHeight: 32,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
  },
  stepCounter: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    flex: 1,
    width: '100%',
  },
  footer: {
    marginBottom: SPACING.xl,
  },
});
