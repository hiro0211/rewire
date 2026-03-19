import React from 'react';
import { render } from '@testing-library/react-native';
import { SurveyStepRenderer } from '../SurveyStepRenderer';
import { SURVEY_QUESTIONS } from '@/constants/survey';

describe('SurveyStepRenderer', () => {
  const defaultProps = {
    question: SURVEY_QUESTIONS[0],
    answers: {} as Record<string, string>,
    onSelectAnswer: jest.fn(),
  };

  it('choice タイプの質問でSurveyChoiceStepを描画する', () => {
    const { getByText } = render(<SurveyStepRenderer {...defaultProps} />);
    expect(getByText('あなたの年齢を教えてください')).toBeTruthy();
  });

  it('text_input タイプの質問でSurveyTextStepを描画する', () => {
    const textQuestion = SURVEY_QUESTIONS.find((q) => q.type === 'text_input')!;
    const { getByTestId } = render(
      <SurveyStepRenderer {...defaultProps} question={textQuestion} />
    );
    expect(getByTestId('survey-text-input')).toBeTruthy();
  });
});
