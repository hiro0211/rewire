import React from 'react';
import { SurveyChoiceStep } from './SurveyChoiceStep';
import { SurveyTextStep } from './SurveyTextStep';
import type { SurveyQuestion } from '@/types/survey';

interface SurveyStepRendererProps {
  question: SurveyQuestion;
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, value: string) => void;
}

export function SurveyStepRenderer({
  question,
  answers,
  onSelectAnswer,
}: SurveyStepRendererProps) {
  switch (question.type) {
    case 'choice':
      return (
        <SurveyChoiceStep
          question={question}
          selectedValue={answers[question.id]}
          onSelect={(value) => onSelectAnswer(question.id, value)}
        />
      );
    case 'text_input':
      return (
        <SurveyTextStep
          question={question}
          value={answers[question.id] ?? ''}
          onChangeText={(text) => onSelectAnswer(question.id, text)}
        />
      );
    default:
      return null;
  }
}
