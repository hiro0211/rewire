import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AssessmentChoiceStep } from '../AssessmentChoiceStep';
import type { AssessmentQuestion } from '@/constants/assessment';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

const MOCK_QUESTION: AssessmentQuestion = {
  id: 'frequency',
  questionKey: 'mock.frequency.question',
  type: 'choice',
  options: [
    { labelKey: 'mock.frequency.multipleTimes', value: 'multiple_daily', score: 4 },
    { labelKey: 'mock.frequency.daily', value: 'daily', score: 3 },
    { labelKey: 'mock.frequency.weekly', value: 'weekly', score: 2 },
  ],
};

describe('AssessmentChoiceStep（QUITTR風リデザイン）', () => {
  const defaultProps = {
    question: MOCK_QUESTION,
    questionIndex: 2,
    totalQuestions: 9,
    selectedValue: undefined as string | undefined,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ナンバーバッジ', () => {
    it('各選択肢に番号バッジ（1, 2, 3）が表示される', () => {
      const { getByText } = render(<AssessmentChoiceStep {...defaultProps} />);
      expect(getByText('1')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });

    it('選択済みの選択肢はチェックマークアイコンが表示される', () => {
      const { getByTestId } = render(
        <AssessmentChoiceStep {...defaultProps} selectedValue="daily" />
      );
      expect(getByTestId('badge-checkmark-1')).toBeTruthy();
    });

    it('未選択の選択肢は番号が表示される', () => {
      const { getByText } = render(
        <AssessmentChoiceStep {...defaultProps} selectedValue="daily" />
      );
      expect(getByText('1')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });
  });

  describe('質問表示', () => {
    it('質問番号に "Question #" フォーマットが使われる', () => {
      const { getByText } = render(<AssessmentChoiceStep {...defaultProps} />);
      expect(getByText('Question #3')).toBeTruthy();
    });

    it('testID="question-heading" が存在する', () => {
      const { getByTestId } = render(<AssessmentChoiceStep {...defaultProps} />);
      expect(getByTestId('question-heading')).toBeTruthy();
    });

    it('質問テキストが表示される', () => {
      const { getByText } = render(<AssessmentChoiceStep {...defaultProps} />);
      expect(getByText('mock.frequency.question')).toBeTruthy();
    });

    it('全選択肢のラベルが表示される', () => {
      const { getByText } = render(<AssessmentChoiceStep {...defaultProps} />);
      expect(getByText('mock.frequency.multipleTimes')).toBeTruthy();
      expect(getByText('mock.frequency.daily')).toBeTruthy();
      expect(getByText('mock.frequency.weekly')).toBeTruthy();
    });
  });

  describe('ピルスタイル', () => {
    it('各ピルに testID="option-pill-{index}" が存在する', () => {
      const { getByTestId } = render(<AssessmentChoiceStep {...defaultProps} />);
      expect(getByTestId('option-pill-0')).toBeTruthy();
      expect(getByTestId('option-pill-1')).toBeTruthy();
      expect(getByTestId('option-pill-2')).toBeTruthy();
    });
  });

  describe('インタラクション', () => {
    it('選択肢をタップするとonSelectが呼ばれる', () => {
      const onSelect = jest.fn();
      const { getByText } = render(
        <AssessmentChoiceStep {...defaultProps} onSelect={onSelect} />
      );
      fireEvent.press(getByText('mock.frequency.weekly'));
      expect(onSelect).toHaveBeenCalledWith('weekly');
    });
  });
});
