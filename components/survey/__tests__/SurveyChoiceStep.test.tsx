import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SurveyChoiceStep } from '../SurveyChoiceStep';
import type { SurveyQuestion } from '@/types/survey';

const MOCK_QUESTION: SurveyQuestion = {
  id: 'age_range',
  question: 'あなたの年齢を教えてください',
  type: 'choice',
  options: [
    { label: '18〜24歳', value: '18-24' },
    { label: '25〜34歳', value: '25-34' },
    { label: '35〜44歳', value: '35-44' },
  ],
  required: true,
};

describe('SurveyChoiceStep', () => {
  const defaultProps = {
    question: MOCK_QUESTION,
    selectedValue: undefined as string | undefined,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('質問テキストが表示される', () => {
    const { getByText } = render(<SurveyChoiceStep {...defaultProps} />);
    expect(getByText('あなたの年齢を教えてください')).toBeTruthy();
  });

  it('全選択肢のラベルが表示される', () => {
    const { getByText } = render(<SurveyChoiceStep {...defaultProps} />);
    expect(getByText('18〜24歳')).toBeTruthy();
    expect(getByText('25〜34歳')).toBeTruthy();
    expect(getByText('35〜44歳')).toBeTruthy();
  });

  it('選択肢をタップするとonSelectが呼ばれる', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <SurveyChoiceStep {...defaultProps} onSelect={onSelect} />
    );
    fireEvent.press(getByText('25〜34歳'));
    expect(onSelect).toHaveBeenCalledWith('25-34');
  });

  it('選択済みの選択肢にチェックマークが表示される', () => {
    const { getByTestId } = render(
      <SurveyChoiceStep {...defaultProps} selectedValue="25-34" />
    );
    expect(getByTestId('badge-checkmark-1')).toBeTruthy();
  });

  it('各ピルにtestIDが存在する', () => {
    const { getByTestId } = render(<SurveyChoiceStep {...defaultProps} />);
    expect(getByTestId('option-pill-0')).toBeTruthy();
    expect(getByTestId('option-pill-1')).toBeTruthy();
    expect(getByTestId('option-pill-2')).toBeTruthy();
  });
});
