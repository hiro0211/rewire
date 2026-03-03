import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
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
import { clampDay, getDaysInMonth, isDateInFuture } from '@/lib/date/datePickerUtils';
import { format } from 'date-fns';
import { useOnboardingForm } from '@/hooks/onboarding/useOnboardingForm';
import { useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingNavigation';
import {
  FEATURES,
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
  const translateX = useRef(new Animated.Value(0)).current;
  const autoAdvancingRef = useRef(false);
  const { colors } = useTheme();

  // Refs to access latest state from PanResponder closure
  const stateRef = useRef({
    step: nav.step,
    nickname: form.nickname,
    privacyAgreed: form.privacyAgreed,
    dataAgreed: form.dataAgreed,
    answers: form.answers,
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
    notifyTime: form.notifyTime,
    lastViewedYear: form.lastViewedYear,
    lastViewedMonth: form.lastViewedMonth,
    lastViewedDay: form.lastViewedDay,
  };

  const animateTransition = (direction: number, callback: () => void) => {
    Animated.timing(translateX, {
      toValue: direction * 300,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(direction * -300);
      callback();
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const canAdvanceAt = (s: number) => {
    const { nickname: n, privacyAgreed: p, dataAgreed: d, answers: a,
      lastViewedYear: y, lastViewedMonth: m, lastViewedDay: dy } = stateRef.current;
    const cs = STEPS[s];
    switch (cs.type) {
      case 'assessment_choice':
      case 'assessment_yesno':
        return !!a[cs.questionId];
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

  const SWIPE_THRESHOLD = 50;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => {
        const cs = STEPS[stateRef.current.step];
        if (cs.type === 'analyzing') return false;
        return Math.abs(gs.dx) > 20 && Math.abs(gs.dy) < 50;
      },
      onPanResponderRelease: (_, gs) => {
        if (autoAdvancingRef.current) return;
        const s = stateRef.current.step;
        if (gs.dx < -SWIPE_THRESHOLD) {
          if (s < STEPS.length - 1 && canAdvanceAt(s)) {
            animateTransition(-1, () => nav.goToStep(s + 1));
          }
        } else if (gs.dx > SWIPE_THRESHOLD) {
          if (canGoBack(s)) {
            animateTransition(1, () => nav.goToStep(s - 1));
          }
        }
      },
    }),
  ).current;

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
        },
      });
    }
  };

  const handleBack = () => {
    if (canGoBack(nav.step)) {
      animateTransition(1, () => nav.goToPreviousStep());
    }
  };

  const handleSkipEducation = () => {
    animateTransition(-1, () => nav.goToStep(FEATURES_STEP_INDEX));
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

  const renderStep = () => {
    switch (currentStep.type) {
      case 'welcome':
        return (
          <View style={styles.fullWidth}>
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeContent}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {'ポルノをやめる、\n人生を変える'}
                </Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  {'9つの質問に答えるだけ。\nあなたの依存度をチェックし、\n最適なプランを作成します。'}
                </Text>
                <Card variant="outlined" style={styles.privacyCard}>
                  <View style={styles.privacyRow}>
                    <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                      すべての回答はこの端末内にのみ保存されます
                    </Text>
                  </View>
                </Card>
              </View>
              <Button
                title="始める"
                onPress={() => animateTransition(-1, () => nav.goToNextStep())}
              />
            </View>
          </View>
        );

      case 'assessment_choice': {
        const question = ASSESSMENT_QUESTIONS.find((q) => q.id === currentStep.questionId)!;
        const questionIndex = ASSESSMENT_QUESTIONS.indexOf(question);
        return (
          <View style={styles.fullWidth}>
            <AssessmentChoiceStep
              question={question}
              questionIndex={questionIndex}
              totalQuestions={TOTAL_QUESTIONS}
              selectedValue={form.answers[currentStep.questionId]}
              onSelect={(value) => handleAssessmentAnswer(currentStep.questionId, value)}
            />
          </View>
        );
      }

      case 'assessment_picker': {
        const question = ASSESSMENT_QUESTIONS.find((q) => q.id === currentStep.questionId)!;
        const questionIndex = ASSESSMENT_QUESTIONS.indexOf(question);
        return (
          <View style={styles.fullWidth}>
            <AssessmentPickerStep
              question={question}
              questionIndex={questionIndex}
              totalQuestions={TOTAL_QUESTIONS}
              selectedValue={form.answers[currentStep.questionId]}
              onSelect={(value) => handlePickerSelect(currentStep.questionId, value)}
            />
          </View>
        );
      }

      case 'assessment_yesno': {
        const question = ASSESSMENT_QUESTIONS.find((q) => q.id === currentStep.questionId)!;
        const questionIndex = ASSESSMENT_QUESTIONS.indexOf(question);
        return (
          <View style={styles.fullWidth}>
            <AssessmentYesNoStep
              question={question}
              questionIndex={questionIndex}
              totalQuestions={TOTAL_QUESTIONS}
              selectedValue={form.answers[currentStep.questionId]}
              onSelect={(value) => handleAssessmentAnswer(currentStep.questionId, value)}
            />
          </View>
        );
      }

      case 'analyzing':
        return (
          <View style={styles.fullWidth}>
            <AnalyzingStep
              onComplete={() => animateTransition(-1, () => nav.goToNextStep())}
            />
          </View>
        );

      case 'score_result':
        return (
          <View style={styles.fullWidth}>
            <ScoreResultStep score={calculateScore(form.answers)} maxScore={MAX_SCORE} />
          </View>
        );

      case 'education':
        return (
          <View style={styles.fullWidth}>
            <EducationSlideStep
              slide={EDUCATION_SLIDES[currentStep.slideIndex]}
              slideIndex={currentStep.slideIndex}
              totalSlides={EDUCATION_SLIDES.length}
            />
          </View>
        );

      case 'damage_intro':
        return (
          <View style={styles.fullWidth}>
            <TransitionSlideStep />
          </View>
        );

      case 'damage':
        return (
          <View style={styles.fullWidth}>
            <EducationSlideStep
              slide={DAMAGE_SLIDES[currentStep.slideIndex]}
              slideIndex={currentStep.slideIndex}
              totalSlides={DAMAGE_SLIDES.length}
            />
          </View>
        );

      case 'recovery':
        return (
          <View style={styles.fullWidth}>
            <EducationSlideStep
              slide={RECOVERY_SLIDES[currentStep.slideIndex]}
              slideIndex={currentStep.slideIndex}
              totalSlides={RECOVERY_SLIDES.length}
            />
          </View>
        );

      case 'features':
        return (
          <View style={styles.centeredContent}>
            <Text style={[styles.title, { color: colors.text }]}>Rewireでできること</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{''}</Text>
            <View style={styles.featuresContainer}>
              {FEATURES.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={[styles.featureIconContainer, { backgroundColor: colors.surfaceHighlight }]}>
                    <Ionicons name={feature.icon} size={28} color={colors.primary} />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <View style={styles.featureTitleRow}>
                      <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                    </View>
                    <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 'nickname':
        return (
          <View style={styles.centeredContent}>
            <Text style={[styles.title, { color: colors.text }]}>あなたの名前は？</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {'アプリ内で呼びかけるニックネームを教えてください。\n（匿名で構いません）'}
            </Text>
            <TextInput
              style={[styles.input, { borderBottomColor: colors.primary, color: colors.text }]}
              placeholder="ニックネーム"
              placeholderTextColor={colors.textSecondary}
              value={form.nickname}
              onChangeText={form.setNickname}
              autoFocus
            />
          </View>
        );

      case 'consent':
        return (
          <View style={styles.centeredContent}>
            <Text style={[styles.title, { color: colors.text }]}>データの取り扱いについて</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {'Rewireはあなたの変化をサポートするため、\n以下のデータを端末内にのみ保存します。'}
            </Text>
            <View style={styles.consentContainer}>
              <Text style={[styles.dataList, { color: colors.text }]}>
                {'・性的行動に関する記録\n・ストレスレベル・衝動レベル\n・呼吸エクササイズの記録\n・振り返り記録・日記'}
              </Text>
              <TouchableOpacity
                testID="checkbox-privacy"
                style={styles.checkboxRow}
                onPress={form.togglePrivacyAgreed}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: colors.textSecondary },
                    form.privacyAgreed && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  {form.privacyAgreed && (
                    <Ionicons name="checkmark" size={16} color={colors.contrastText} />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  <Text
                    testID="link-privacy-policy"
                    style={[styles.linkText, { color: colors.cyan }]}
                    onPress={() => WebBrowser.openBrowserAsync('https://hiro0211.github.io/rewire-support/#privacy')}
                  >
                    プライバシーポリシー
                  </Text>
                  {' に同意します'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="checkbox-terms"
                style={styles.checkboxRow}
                onPress={form.toggleDataAgreed}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: colors.textSecondary },
                    form.dataAgreed && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  {form.dataAgreed && (
                    <Ionicons name="checkmark" size={16} color={colors.contrastText} />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  <Text
                    testID="link-terms"
                    style={[styles.linkText, { color: colors.cyan }]}
                    onPress={() => WebBrowser.openBrowserAsync('https://hiro0211.github.io/rewire-support/#terms')}
                  >
                    利用規約
                  </Text>
                  {' に同意し、データの保存を許可します'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'notification':
        return (
          <View style={styles.fullWidth}>
            <NotificationSetupStep
              selectedTime={form.notifyTime}
              onTimeChange={form.setNotifyTime}
            />
          </View>
        );

      case 'last_viewed_date':
        return (
          <View style={styles.fullWidth}>
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
          </View>
        );

      default:
        return null;
    }
  };

  const backgroundConfig = currentStep.type === 'damage_intro'
    ? { gradientColors: ['#0A0A0F', '#1a1a3e', '#2d1b4e'] as string[], showStars: false }
    : {};

  const content = (
    <>
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
              onPress={handleSkipEducation}
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
        {renderStep()}
      </Animated.View>

      {showFooter && (
        <View style={styles.footer}>
          <Button title="次へ" onPress={handleNext} disabled={isNextDisabled} />
        </View>
      )}
    </>
  );

  return (
    <StarryBackground {...backgroundConfig}>
      <SafeAreaWrapper style={styles.container}>
        {content}
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
  centeredContent: {
    alignItems: 'center',
    width: '100%',
  },
  fullWidth: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  welcomeContent: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  privacyCard: {
    width: '100%',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  privacyText: {
    fontSize: FONT_SIZE.sm,
    flex: 1,
  },
  input: {
    width: '100%',
    height: 50,
    borderBottomWidth: 1,
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
  },
  footer: {
    marginBottom: SPACING.xl,
  },
  featuresContainer: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  consentContainer: {
    width: '100%',
  },
  dataList: {
    fontSize: FONT_SIZE.md,
    lineHeight: 28,
    marginBottom: SPACING.xl,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkboxLabel: {
    fontSize: FONT_SIZE.md,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});
