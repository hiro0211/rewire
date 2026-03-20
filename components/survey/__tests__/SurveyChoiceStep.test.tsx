import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SurveyChoiceStep } from '../SurveyChoiceStep';
import type { SurveyQuestion } from '@/types/survey';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

const MOCK_QUESTION: SurveyQuestion = {
  id: 'age_range',
  questionKey: 'mock.ageRange.question',
  type: 'choice',
  options: [
    { labelKey: 'mock.ageRange.18to24', value: '18-24' },
    { labelKey: 'mock.ageRange.25to34', value: '25-34' },
    { labelKey: 'mock.ageRange.35to44', value: '35-44' },
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
    expect(getByText('mock.ageRange.question')).toBeTruthy();
  });

  it('全選択肢のラベルが表示される', () => {
    const { getByText } = render(<SurveyChoiceStep {...defaultProps} />);
    expect(getByText('mock.ageRange.18to24')).toBeTruthy();
    expect(getByText('mock.ageRange.25to34')).toBeTruthy();
    expect(getByText('mock.ageRange.35to44')).toBeTruthy();
  });

  it('選択肢をタップするとonSelectが呼ばれる', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <SurveyChoiceStep {...defaultProps} onSelect={onSelect} />
    );
    fireEvent.press(getByText('mock.ageRange.25to34'));
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
