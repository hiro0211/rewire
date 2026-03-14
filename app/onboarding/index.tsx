import React, { useRef } from 'react';
import { View, StyleSheet, Animated, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StarryBackground } from '@/components/onboarding/StarryBackground';
import { ASSESSMENT_QUESTIONS, MAX_SCORE } from '@/constants/assessment';
import { EDUCATION_SLIDES, DAMAGE_SLIDES, RECOVERY_SLIDES } from '@/constants/education';
import { calculateScore } from '@/lib/assessment/scoreCalculator';
import { AssessmentChoiceStep } from '@/components/onboarding/AssessmentChoiceStep';
import { AssessmentPickerStep } from '@/components/onboarding/AssessmentPickerStep';
import { AssessmentYesNoStep } from '@/components/onboarding/AssessmentYesNoStep';
import { ScoreResultStep } from '@/components/onboarding/ScoreResultStep';
import { AnalyzingStep } from '@/components/onboarding/AnalyzingStep';
import { EducationSlideStep } from '@/components/onboarding/EducationSlideStep';
import { NotificationSetupStep } from '@/components/onboarding/NotificationSetupStep';
import { LastViewedDateStep } from '@/components/onboarding/LastViewedDateStep';
import { TransitionSlideStep } from '@/components/onboarding/TransitionSlideStep';
import { SymptomSelectStep } from '@/components/onboarding/SymptomSelectStep';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { FeaturesStep } from '@/components/onboarding/steps/FeaturesStep';
import { NicknameStep } from '@/components/onboarding/steps/NicknameStep';
import { ConsentStep } from '@/components/onboarding/steps/ConsentStep';
import { clampDay, getDaysInMonth, isDateInFuture } from '@/lib/date/datePickerUtils';
import { format } from 'date-fns';
import { useOnboardingForm } from '@/hooks/onboarding/useOnboardingForm';
import { useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingNavigation';
import { useOnboardingAnimation } from '@/hooks/onboarding/useOnboardingAnimation';
import {
  STEPS,
  TOTAL_QUESTIONS,
  NO_FOOTER_TYPES,
  NON_COUNTABLE_TYPES,
  FEATURES_STEP_INDEX,
  STEP_COUNTER_MAP,
  TOTAL_COUNTABLE_STEPS,
  canGoBack,
  isEducationStep,
} from '@/constants/onboarding';

export default function OnboardingScreen() {
  const form = useOnboardingForm();
  const nav = useOnboardingNavigation();
  const router = useRouter();
  const autoAdvancingRef = useRef(false);
  const { colors } = useTheme();

  const stateRef = useRef({
    step: nav.step,
    nickname: form.nickname,
    privacyAgreed: form.privacyAgreed,
    dataAgreed: form.dataAgreed,
    answers: form.answers,
    selectedSymptoms: form.selectedSymptoms,
    notifyTime: form.notifyTime,
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
    selectedSymptoms: form.selectedSymptoms,
    notifyTime: form.notifyTime,
    lastViewedYear: form.lastViewedYear,
    lastViewedMonth: form.lastViewedMonth,
    lastViewedDay: form.lastViewedDay,
  };

  const canAdvanceAt = (s: number) => {
    const { nickname: n, privacyAgreed: p, dataAgreed: d, answers: a,
      lastViewedYear: y, lastViewedMonth: m, lastViewedDay: dy } = stateRef.current;
    const cs = STEPS[s];
    switch (cs.type) {
      case 'assessment_choice':
      case 'assessment_yesno':
      case 'assessment_picker':
        return !!a[cs.questionId];
      case 'nickname':
        return !!n.trim();
      case 'consent':
        return p && d;
      case 'last_viewed_date':
        return !isDateInFuture(y, m, dy);
      default:
        return true;
    }
  };

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

  const currentStep = nav.currentStep;
  const showFooter = !NO_FOOTER_TYPES.has(currentStep.type);
  const isNextDisabled = !canAdvanceAt(nav.step);
  const showSkip = isEducationStep(currentStep);
  const footerButtonTitle = currentStep.type === 'score_result' ? '症状を確認してみる' : '次へ';

  const renderStep = () => {
    switch (currentStep.type) {
      case 'welcome':
        return <WelcomeStep onStart={() => animateTransition(-1, () => nav.goToNextStep())} />;
      case 'assessment_choice': {
        const question = ASSESSMENT_QUESTIONS.find((q) => q.id === currentStep.questionId)!;
        return (
          <AssessmentChoiceStep
            question={question}
            questionIndex={ASSESSMENT_QUESTIONS.indexOf(question)}
            totalQuestions={TOTAL_QUESTIONS}
            selectedValue={form.answers[currentStep.questionId]}
            onSelect={(value) => handleAssessmentAnswer(currentStep.questionId, value)}
          />
        );
      }
      case 'assessment_picker': {
        const question = ASSESSMENT_QUESTIONS.find((q) => q.id === currentStep.questionId)!;
        return (
          <AssessmentPickerStep
            question={question}
            questionIndex={ASSESSMENT_QUESTIONS.indexOf(question)}
            totalQuestions={TOTAL_QUESTIONS}
            selectedValue={form.answers[currentStep.questionId]}
            onSelect={(value) => handlePickerSelect(currentStep.questionId, value)}
          />
        );
      }
      case 'assessment_yesno': {
        const question = ASSESSMENT_QUESTIONS.find((q) => q.id === currentStep.questionId)!;
        return (
          <AssessmentYesNoStep
            question={question}
            questionIndex={ASSESSMENT_QUESTIONS.indexOf(question)}
            totalQuestions={TOTAL_QUESTIONS}
            selectedValue={form.answers[currentStep.questionId]}
            onSelect={(value) => handleAssessmentAnswer(currentStep.questionId, value)}
          />
        );
      }
      case 'analyzing':
        return <AnalyzingStep onComplete={() => animateTransition(-1, () => nav.goToNextStep())} />;
      case 'score_result':
        return <ScoreResultStep score={calculateScore(form.answers)} maxScore={MAX_SCORE} />;
      case 'symptom_select':
        return (
          <SymptomSelectStep
            selectedSymptoms={form.selectedSymptoms}
            onToggleSymptom={form.toggleSymptom}
          />
        );
      case 'education':
        return (
          <EducationSlideStep
            slide={EDUCATION_SLIDES[currentStep.slideIndex]}
            slideIndex={currentStep.slideIndex}
            totalSlides={EDUCATION_SLIDES.length}
          />
        );
      case 'damage_intro':
        return <TransitionSlideStep />;
      case 'damage':
        return (
          <EducationSlideStep
            slide={DAMAGE_SLIDES[currentStep.slideIndex]}
            slideIndex={currentStep.slideIndex}
            totalSlides={DAMAGE_SLIDES.length}
          />
        );
      case 'recovery':
        return (
          <EducationSlideStep
            slide={RECOVERY_SLIDES[currentStep.slideIndex]}
            slideIndex={currentStep.slideIndex}
            totalSlides={RECOVERY_SLIDES.length}
          />
        );
      case 'features':
        return <FeaturesStep />;
      case 'nickname':
        return <NicknameStep nickname={form.nickname} onChangeNickname={form.setNickname} />;
      case 'consent':
        return (
          <ConsentStep
            privacyAgreed={form.privacyAgreed}
            dataAgreed={form.dataAgreed}
            onTogglePrivacy={form.togglePrivacyAgreed}
            onToggleData={form.toggleDataAgreed}
          />
        );
      case 'notification':
        return <NotificationSetupStep selectedTime={form.notifyTime} onTimeChange={form.setNotifyTime} />;
      case 'last_viewed_date':
        return (
          <LastViewedDateStep
            selectedYear={form.lastViewedYear}
            selectedMonth={form.lastViewedMonth}
            selectedDay={form.lastViewedDay}
            onYearChange={(y) => {
              form.setLastViewedYear(y);
              const maxDay = getDaysInMonth(y, form.lastViewedMonth);
              form.setLastViewedDay((d: number) => clampDay(d, maxDay));
            }}
            onMonthChange={(m) => {
              form.setLastViewedMonth(m);
              const maxDay = getDaysInMonth(form.lastViewedYear, m);
              form.setLastViewedDay((d: number) => clampDay(d, maxDay));
            }}
            onDayChange={form.setLastViewedDay}
          />
        );
      default:
        return null;
    }
  };

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
                onPress={() => animateTransition(-1, () => nav.goToStep(FEATURES_STEP_INDEX))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>スキップ</Text>
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
          <View style={styles.fullWidth}>{renderStep()}</View>
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
