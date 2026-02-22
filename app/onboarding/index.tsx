import React, { useState, useRef } from 'react';
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
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { useUserStore } from '@/stores/userStore';
import { ASSESSMENT_QUESTIONS, MAX_SCORE } from '@/constants/assessment';
import { EDUCATION_SLIDES, EDUCATION_QUIZ, DAMAGE_SLIDES, RECOVERY_SLIDES } from '@/constants/education';
import { calculateScore } from '@/lib/assessment/scoreCalculator';
import { AssessmentChoiceStep } from '@/components/onboarding/AssessmentChoiceStep';
import { AssessmentPickerStep } from '@/components/onboarding/AssessmentPickerStep';
import { AssessmentYesNoStep } from '@/components/onboarding/AssessmentYesNoStep';
import { ScoreResultStep } from '@/components/onboarding/ScoreResultStep';
import { AnalyzingStep } from '@/components/onboarding/AnalyzingStep';
import { EducationSlideStep } from '@/components/onboarding/EducationSlideStep';
import { EducationQuizStep } from '@/components/onboarding/EducationQuizStep';

const FEATURES = [
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Safariポルノブロッカー',
    description: 'アダルトサイトへのアクセスを自動ブロック',
    pro: true,
  },
  {
    icon: 'analytics-outline' as const,
    title: '毎日の振り返り',
    description: '衝動やストレスを記録して自分を客観視',
    pro: false,
  },
  {
    icon: 'fitness-outline' as const,
    title: '呼吸エクササイズ',
    description: '衝動が来たとき、呼吸で乗り越える',
    pro: false,
  },
];

// --- Step definitions ---

type OnboardingStep =
  | { type: 'welcome' }
  | { type: 'assessment_choice'; questionId: string }
  | { type: 'assessment_picker'; questionId: string }
  | { type: 'assessment_yesno'; questionId: string }
  | { type: 'analyzing' }
  | { type: 'score_result' }
  | { type: 'education'; slideIndex: number }
  | { type: 'education_quiz' }
  | { type: 'damage'; slideIndex: number }
  | { type: 'recovery'; slideIndex: number }
  | { type: 'features' }
  | { type: 'nickname' }
  | { type: 'consent' }
  | { type: 'notification' };

const STEPS: OnboardingStep[] = [
  { type: 'welcome' },
  ...ASSESSMENT_QUESTIONS.map((q): OnboardingStep => {
    if (q.type === 'choice') return { type: 'assessment_choice' as const, questionId: q.id };
    if (q.type === 'picker') return { type: 'assessment_picker' as const, questionId: q.id };
    return { type: 'assessment_yesno' as const, questionId: q.id };
  }),
  { type: 'analyzing' },
  { type: 'score_result' },
  ...EDUCATION_SLIDES.map((_, i): OnboardingStep => ({ type: 'education' as const, slideIndex: i })),
  { type: 'education_quiz' },
  ...DAMAGE_SLIDES.map((_, i): OnboardingStep => ({ type: 'damage' as const, slideIndex: i })),
  ...RECOVERY_SLIDES.map((_, i): OnboardingStep => ({ type: 'recovery' as const, slideIndex: i })),
  { type: 'features' },
  { type: 'nickname' },
  { type: 'consent' },
  { type: 'notification' },
];

const TOTAL_QUESTIONS = ASSESSMENT_QUESTIONS.length;

// Steps that don't show the default footer button
const NO_FOOTER_TYPES = new Set([
  'welcome',
  'assessment_choice',
  'assessment_yesno',
  'analyzing',
]);

/** Granular back-navigation control */
function canGoBack(stepIndex: number): boolean {
  if (stepIndex <= 0) return false;
  const cs = STEPS[stepIndex];
  switch (cs.type) {
    case 'welcome':
    case 'analyzing':
    case 'score_result':
    case 'features':
    case 'nickname':
    case 'consent':
    case 'notification':
      return false;
    case 'education':
      // First education slide cannot go back (would return to score_result)
      return cs.slideIndex > 0;
    case 'education_quiz':
      return true;
    case 'damage':
      // First damage slide cannot go back (would return to quiz)
      return cs.slideIndex > 0;
    case 'recovery':
      return true;
    default:
      return true;
  }
}

/** Check if current step is in the education section (for skip button) */
function isEducationStep(cs: OnboardingStep): boolean {
  return cs.type === 'education' || cs.type === 'education_quiz'
      || cs.type === 'damage' || cs.type === 'recovery';
}

/** Find the index of the features step (skip target) */
const FEATURES_STEP_INDEX = STEPS.findIndex((s) => s.type === 'features');

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [dataAgreed, setDataAgreed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizAnswered, setQuizAnswered] = useState(false);
  const { setUser } = useUserStore();
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const autoAdvancingRef = useRef(false);

  // Refs to access latest state from PanResponder closure
  const stateRef = useRef({ step, nickname, privacyAgreed, dataAgreed, answers, quizAnswered });
  stateRef.current = { step, nickname, privacyAgreed, dataAgreed, answers, quizAnswered };

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
    const { nickname: n, privacyAgreed: p, dataAgreed: d, answers: a, quizAnswered: qa } = stateRef.current;
    const cs = STEPS[s];
    switch (cs.type) {
      case 'assessment_choice':
      case 'assessment_yesno':
        return !!a[cs.questionId];
      case 'assessment_picker':
        return !!a[cs.questionId];
      case 'education_quiz':
        return qa;
      case 'nickname':
        return !!n.trim();
      case 'consent':
        return p && d;
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
        const cs = STEPS[s];
        if (gs.dx < -SWIPE_THRESHOLD) {
          if (s < STEPS.length - 1 && canAdvanceAt(s)) {
            animateTransition(-1, () => setStep(s + 1));
          }
        } else if (gs.dx > SWIPE_THRESHOLD) {
          if (canGoBack(s)) {
            animateTransition(1, () => setStep(s - 1));
          }
        }
      },
    }),
  ).current;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      if (!canAdvanceAt(step)) return;
      animateTransition(-1, () => setStep(step + 1));
    } else {
      router.push({
        pathname: '/onboarding/goal',
        params: {
          nickname,
          consentGivenAt: new Date().toISOString(),
        },
      });
    }
  };

  const handleBack = () => {
    if (canGoBack(step)) {
      animateTransition(1, () => setStep(step - 1));
    }
  };

  const handleSkipEducation = () => {
    animateTransition(-1, () => setStep(FEATURES_STEP_INDEX));
  };

  const handleAssessmentAnswer = (questionId: string, value: string) => {
    if (autoAdvancingRef.current) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    autoAdvancingRef.current = true;
    setTimeout(() => {
      animateTransition(-1, () => {
        setStep((prev) => prev + 1);
        autoAdvancingRef.current = false;
      });
    }, 300);
  };

  const handlePickerSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const currentStep = STEPS[step];
  const showFooter = !NO_FOOTER_TYPES.has(currentStep.type);
  const isNextDisabled = !canAdvanceAt(step);
  const showSkip = isEducationStep(currentStep);

  // --- Render helpers ---

  const renderStep = () => {
    switch (currentStep.type) {
      case 'welcome':
        return (
          <View style={styles.fullWidth}>
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeContent}>
                <Text style={styles.title}>
                  {'ポルノをやめる、\n人生を変える'}
                </Text>
                <Text style={styles.description}>
                  {'9つの質問に答えるだけ。\nあなたの依存度をチェックし、\n最適なプランを作成します。'}
                </Text>
                <Card variant="outlined" style={styles.privacyCard}>
                  <View style={styles.privacyRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={16}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.privacyText}>
                      すべての回答はこの端末内にのみ保存されます
                    </Text>
                  </View>
                </Card>
              </View>
              <Button
                title="始める"
                onPress={() => animateTransition(-1, () => setStep(step + 1))}
              />
            </View>
          </View>
        );

      case 'assessment_choice': {
        const question = ASSESSMENT_QUESTIONS.find(
          (q) => q.id === currentStep.questionId,
        )!;
        const questionIndex = ASSESSMENT_QUESTIONS.indexOf(question);
        return (
          <View style={styles.fullWidth}>
            <AssessmentChoiceStep
              question={question}
              questionIndex={questionIndex}
              totalQuestions={TOTAL_QUESTIONS}
              selectedValue={answers[currentStep.questionId]}
              onSelect={(value) =>
                handleAssessmentAnswer(currentStep.questionId, value)
              }
            />
          </View>
        );
      }

      case 'assessment_picker': {
        const question = ASSESSMENT_QUESTIONS.find(
          (q) => q.id === currentStep.questionId,
        )!;
        const questionIndex = ASSESSMENT_QUESTIONS.indexOf(question);
        return (
          <View style={styles.fullWidth}>
            <AssessmentPickerStep
              question={question}
              questionIndex={questionIndex}
              totalQuestions={TOTAL_QUESTIONS}
              selectedValue={answers[currentStep.questionId]}
              onSelect={(value) =>
                handlePickerSelect(currentStep.questionId, value)
              }
            />
          </View>
        );
      }

      case 'assessment_yesno': {
        const question = ASSESSMENT_QUESTIONS.find(
          (q) => q.id === currentStep.questionId,
        )!;
        const questionIndex = ASSESSMENT_QUESTIONS.indexOf(question);
        return (
          <View style={styles.fullWidth}>
            <AssessmentYesNoStep
              question={question}
              questionIndex={questionIndex}
              totalQuestions={TOTAL_QUESTIONS}
              selectedValue={answers[currentStep.questionId]}
              onSelect={(value) =>
                handleAssessmentAnswer(currentStep.questionId, value)
              }
            />
          </View>
        );
      }

      case 'analyzing':
        return (
          <View style={styles.fullWidth}>
            <AnalyzingStep
              onComplete={() =>
                animateTransition(-1, () => setStep(step + 1))
              }
            />
          </View>
        );

      case 'score_result':
        return (
          <View style={styles.fullWidth}>
            <ScoreResultStep
              score={calculateScore(answers)}
              maxScore={MAX_SCORE}
            />
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

      case 'education_quiz':
        return (
          <View style={styles.fullWidth}>
            <EducationQuizStep
              quiz={EDUCATION_QUIZ}
              onAnswered={() => setQuizAnswered(true)}
            />
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
            <Text style={styles.title}>Rewireでできること</Text>
            <Text style={styles.description}>{''}</Text>
            <View style={styles.featuresContainer}>
              {FEATURES.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons
                      name={feature.icon}
                      size={28}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <View style={styles.featureTitleRow}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      {feature.pro && (
                        <View style={styles.proBadge}>
                          <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.featureDescription}>
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
            <Text style={styles.title}>あなたの名前は？</Text>
            <Text style={styles.description}>
              {'アプリ内で呼びかけるニックネームを教えてください。\n（匿名で構いません）'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="ニックネーム"
              placeholderTextColor={COLORS.textSecondary}
              value={nickname}
              onChangeText={setNickname}
              autoFocus
            />
          </View>
        );

      case 'consent':
        return (
          <View style={styles.centeredContent}>
            <Text style={styles.title}>データの取り扱いについて</Text>
            <Text style={styles.description}>
              {'Rewireはあなたの変化をサポートするため、\n以下のデータを端末内にのみ保存します。'}
            </Text>
            <View style={styles.consentContainer}>
              <Text style={styles.dataList}>
                {'・性的行動に関する記録\n・ストレスレベル・衝動レベル\n・呼吸エクササイズの記録\n・振り返り記録・日記'}
              </Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setPrivacyAgreed(!privacyAgreed)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    privacyAgreed && styles.checkboxChecked,
                  ]}
                >
                  {privacyAgreed && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  プライバシーポリシーに同意します
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setDataAgreed(!dataAgreed)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    dataAgreed && styles.checkboxChecked,
                  ]}
                >
                  {dataAgreed && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  上記データの保存に同意します
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'notification':
        return (
          <View style={styles.centeredContent}>
            <Text style={styles.title}>通知を設定</Text>
            <Text style={styles.description}>
              {'毎日の振り返りを習慣化するために、\n通知を許可してください。'}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaWrapper style={styles.container}>
      {/* Header: back button + skip + progress bar */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {canGoBack(step) ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
          {showSkip ? (
            <TouchableOpacity
              onPress={handleSkipEducation}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.skipText}>スキップ</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
        </View>
        <ProgressBar
          progress={step / (STEPS.length - 1)}
          height={4}
        />
      </View>

      {/* Content */}
      <Animated.View
        style={[styles.content, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {renderStep()}
      </Animated.View>

      {/* Footer */}
      {showFooter && (
        <View style={styles.footer}>
          <Button
            title="次へ"
            onPress={handleNext}
            disabled={isNextDisabled}
          />
        </View>
      )}
    </SafeAreaWrapper>
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 32,
    height: 32,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
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
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  // Welcome (merged with assessment intro)
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
    color: COLORS.textSecondary,
    flex: 1,
  },
  // Form
  input: {
    width: '100%',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    color: COLORS.text,
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
    backgroundColor: COLORS.surfaceHighlight,
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
    color: COLORS.text,
  },
  proBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 8,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  consentContainer: {
    width: '100%',
  },
  dataList: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
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
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
});
