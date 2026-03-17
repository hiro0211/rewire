import React from 'react';
import { ASSESSMENT_QUESTIONS, MAX_SCORE } from '@/constants/assessment';
import { EDUCATION_SLIDES, DAMAGE_SLIDES, RECOVERY_SLIDES } from '@/constants/education';
import { calculateScore } from '@/lib/assessment/scoreCalculator';
import { getDaysInMonth, clampDay } from '@/lib/date/datePickerUtils';
import { TOTAL_QUESTIONS } from '@/constants/onboarding';
import type { OnboardingStep } from '@/constants/onboarding';
import { AssessmentChoiceStep } from './AssessmentChoiceStep';
import { AssessmentPickerStep } from './AssessmentPickerStep';
import { AssessmentYesNoStep } from './AssessmentYesNoStep';
import { ScoreResultStep } from './ScoreResultStep';
import { AnalyzingStep } from './AnalyzingStep';
import { EducationSlideStep } from './EducationSlideStep';
import { NotificationSetupStep } from './NotificationSetupStep';
import { LastViewedDateStep } from './LastViewedDateStep';
import { TransitionSlideStep } from './TransitionSlideStep';
import { SymptomSelectStep } from './SymptomSelectStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { NicknameStep } from './steps/NicknameStep';
import { ConsentStep } from './steps/ConsentStep';

interface OnboardingForm {
  nickname: string;
  setNickname: (v: string) => void;
  privacyAgreed: boolean;
  togglePrivacyAgreed: () => void;
  dataAgreed: boolean;
  toggleDataAgreed: () => void;
  answers: Record<string, string>;
  setAnswer: (id: string, v: string) => void;
  selectedSymptoms: string[];
  toggleSymptom: (id: string) => void;
  notifyTime: string;
  setNotifyTime: (v: string) => void;
  lastViewedYear: number;
  setLastViewedYear: (v: number) => void;
  lastViewedMonth: number;
  setLastViewedMonth: (v: number) => void;
  lastViewedDay: number;
  setLastViewedDay: (v: number | ((prev: number) => number)) => void;
}

interface Props {
  currentStep: OnboardingStep;
  form: OnboardingForm;
  onAssessmentAnswer: (questionId: string, value: string) => void;
  onPickerSelect: (questionId: string, value: string) => void;
  onAutoAdvance: () => void;
}

export function OnboardingStepRenderer({
  currentStep,
  form,
  onAssessmentAnswer,
  onPickerSelect,
  onAutoAdvance,
}: Props) {
  switch (currentStep.type) {
    case 'welcome':
      return <WelcomeStep onStart={onAutoAdvance} />;
    case 'assessment_choice': {
      const question = ASSESSMENT_QUESTIONS.find((q) => q.id === currentStep.questionId)!;
      return (
        <AssessmentChoiceStep
          question={question}
          questionIndex={ASSESSMENT_QUESTIONS.indexOf(question)}
          totalQuestions={TOTAL_QUESTIONS}
          selectedValue={form.answers[currentStep.questionId]}
          onSelect={(value) => onAssessmentAnswer(currentStep.questionId, value)}
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
          onSelect={(value) => onPickerSelect(currentStep.questionId, value)}
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
          onSelect={(value) => onAssessmentAnswer(currentStep.questionId, value)}
        />
      );
    }
    case 'analyzing':
      return <AnalyzingStep onComplete={onAutoAdvance} />;
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
}
