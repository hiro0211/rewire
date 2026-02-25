import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AssessmentYesNoStep } from '../AssessmentYesNoStep';
import type { AssessmentQuestion } from '@/constants/assessment';

const MOCK_QUESTION: AssessmentQuestion = {
  id: 'escalation',
  question: '観ていくうちに、より過激な\nポルノを見るようになりましたか？',
  type: 'yesno',
  yesScore: 4,
};

describe('AssessmentYesNoStep（QUITTR風リデザイン）', () => {
  const defaultProps = {
    question: MOCK_QUESTION,
    questionIndex: 3,
    totalQuestions: 9,
    selectedValue: undefined as string | undefined,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ナンバーバッジ', () => {
    it('「はい」にバッジ番号1が表示される', () => {
      const { getAllByText } = render(<AssessmentYesNoStep {...defaultProps} />);
      // バッジ内の "1" を確認
      expect(getAllByText('1').length).toBeGreaterThanOrEqual(1);
    });

    it('「いいえ」にバッジ番号2が表示される', () => {
      const { getByText } = render(<AssessmentYesNoStep {...defaultProps} />);
      expect(getByText('2')).toBeTruthy();
    });

    it('「はい」選択時にチェックマークが表示される', () => {
      const { getByTestId } = render(
        <AssessmentYesNoStep {...defaultProps} selectedValue="yes" />
      );
      expect(getByTestId('badge-checkmark-0')).toBeTruthy();
    });

    it('「いいえ」選択時にチェックマークが表示される', () => {
      const { getByTestId } = render(
        <AssessmentYesNoStep {...defaultProps} selectedValue="no" />
      );
      expect(getByTestId('badge-checkmark-1')).toBeTruthy();
    });
  });

  describe('縦並びレイアウト', () => {
    it('「はい」と「いいえ」のテキストが表示される', () => {
      const { getByText } = render(<AssessmentYesNoStep {...defaultProps} />);
      expect(getByText('はい')).toBeTruthy();
      expect(getByText('いいえ')).toBeTruthy();
    });

    it('質問テキストが表示される', () => {
      const { getByText } = render(<AssessmentYesNoStep {...defaultProps} />);
      expect(getByText(/より過激な/)).toBeTruthy();
    });

    it('質問番号が表示される', () => {
      const { getByText } = render(<AssessmentYesNoStep {...defaultProps} />);
      expect(getByText(/Q 4\/9/)).toBeTruthy();
    });
  });

  describe('インタラクション', () => {
    it('「はい」をタップするとonSelect("yes")が呼ばれる', () => {
      const onSelect = jest.fn();
      const { getByText } = render(
        <AssessmentYesNoStep {...defaultProps} onSelect={onSelect} />
      );
      fireEvent.press(getByText('はい'));
      expect(onSelect).toHaveBeenCalledWith('yes');
    });

    it('「いいえ」をタップするとonSelect("no")が呼ばれる', () => {
      const onSelect = jest.fn();
      const { getByText } = render(
        <AssessmentYesNoStep {...defaultProps} onSelect={onSelect} />
      );
      fireEvent.press(getByText('いいえ'));
      expect(onSelect).toHaveBeenCalledWith('no');
    });
  });
});
