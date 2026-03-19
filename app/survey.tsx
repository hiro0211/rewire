import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { SurveyStepRenderer } from '@/components/survey/SurveyStepRenderer';
import { SurveyCompletionStep } from '@/components/survey/SurveyCompletionStep';
import { useSurveyForm } from '@/hooks/survey/useSurveyForm';
import { useSurveyNavigation } from '@/hooks/survey/useSurveyNavigation';
import { useSurveySubmit } from '@/hooks/survey/useSurveySubmit';
import { SURVEY_QUESTIONS } from '@/constants/survey';

export default function SurveyScreen() {
  const form = useSurveyForm();
  const nav = useSurveyNavigation();
  const { submit, isSubmitting, isComplete } = useSurveySubmit();
  const router = useRouter();
  const { colors } = useTheme();

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (nav.isLastStep) {
      await submit(form.answers);
    } else {
      nav.goToNextStep();
    }
  };

  const handleBack = () => {
    if (nav.step > 0) {
      nav.goToPreviousStep();
    } else {
      router.back();
    }
  };

  const handleSelectAnswer = (questionId: string, value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    form.setAnswer(questionId, value);
  };

  const handleClose = () => {
    router.back();
  };

  if (isComplete) {
    return (
      <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
        <SurveyCompletionStep onClose={handleClose} />
      </SafeAreaWrapper>
    );
  }

  const currentQuestion = nav.currentQuestion;
  const isChoiceStep = currentQuestion.type === 'choice';
  const hasAnswer = !!form.answers[currentQuestion.id]?.trim();
  const isNextDisabled = currentQuestion.required && !hasAnswer;
  const buttonTitle = nav.isLastStep ? '送信する' : '次へ';

  return (
    <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.backButtonCircle, { backgroundColor: colors.pillBackground }]}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.stepCounter, { color: colors.textSecondary }]}>
            {`${nav.step + 1}/${SURVEY_QUESTIONS.length}`}
          </Text>
        </View>
        <ProgressBar progress={nav.progress} height={4} variant="gradient" />
      </View>

      <View style={styles.content}>
        <SurveyStepRenderer
          question={currentQuestion}
          answers={form.answers}
          onSelectAnswer={handleSelectAnswer}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title={buttonTitle}
          onPress={handleNext}
          disabled={isNextDisabled || isSubmitting}
        />
      </View>
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
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCounter: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    marginBottom: SPACING.xl,
  },
});
