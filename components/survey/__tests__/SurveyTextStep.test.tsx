import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SurveyTextStep } from '../SurveyTextStep';
import type { SurveyQuestion } from '@/types/survey';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

const MOCK_QUESTION: SurveyQuestion = {
  id: 'free_text',
  questionKey: 'mock.freeText.question',
  type: 'text_input',
  required: false,
};

describe('SurveyTextStep', () => {
  const defaultProps = {
    question: MOCK_QUESTION,
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('質問テキストが表示される', () => {
    const { getByText } = render(<SurveyTextStep {...defaultProps} />);
    expect(getByText('mock.freeText.question')).toBeTruthy();
  });

  it('テキスト入力フィールドが存在する', () => {
    const { getByTestId } = render(<SurveyTextStep {...defaultProps} />);
    expect(getByTestId('survey-text-input')).toBeTruthy();
  });

  it('テキスト入力でonChangeTextが呼ばれる', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <SurveyTextStep {...defaultProps} onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByTestId('survey-text-input'), 'テストコメント');
    expect(onChangeText).toHaveBeenCalledWith('テストコメント');
  });

  it('任意であることが表示される', () => {
    const { getByText } = render(<SurveyTextStep {...defaultProps} />);
    expect(getByText('surveyForm.optional')).toBeTruthy();
  });
});
