import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SurveyTextStep } from '../SurveyTextStep';
import type { SurveyQuestion } from '@/types/survey';

const MOCK_QUESTION: SurveyQuestion = {
  id: 'free_text',
  question: 'アプリへのご意見・ご要望があればお聞かせください',
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
    expect(getByText('アプリへのご意見・ご要望があればお聞かせください')).toBeTruthy();
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
    expect(getByText('任意')).toBeTruthy();
  });
});
