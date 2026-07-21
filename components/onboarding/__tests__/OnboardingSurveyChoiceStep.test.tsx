import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingSurveyChoiceStep } from '../OnboardingSurveyChoiceStep';
import type { SurveyQuestion } from '@/types/survey';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

const MOCK_QUESTION: SurveyQuestion = {
  id: 'discovery_channel',
  questionKey: 'survey.discoveryChannel.question',
  type: 'choice',
  options: [
    { labelKey: 'survey.discoveryChannel.appStore', value: 'app_store' },
    { labelKey: 'survey.discoveryChannel.tiktok', value: 'tiktok' },
    { labelKey: 'survey.discoveryChannel.instagram', value: 'instagram' },
  ],
  required: true,
};

describe('OnboardingSurveyChoiceStep', () => {
  const defaultProps = {
    question: MOCK_QUESTION,
    selectedValue: undefined as string | undefined,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('質問表示', () => {
    it('質問テキストが表示される', () => {
      const { getByText } = render(<OnboardingSurveyChoiceStep {...defaultProps} />);
      expect(getByText('survey.discoveryChannel.question')).toBeTruthy();
    });

    it('全選択肢のラベルが表示される', () => {
      const { getByText } = render(<OnboardingSurveyChoiceStep {...defaultProps} />);
      expect(getByText('survey.discoveryChannel.appStore')).toBeTruthy();
      expect(getByText('survey.discoveryChannel.tiktok')).toBeTruthy();
      expect(getByText('survey.discoveryChannel.instagram')).toBeTruthy();
    });

    it('assessment の "Question #" カウンターは表示しない（採点対象ではないため）', () => {
      const { queryByText } = render(<OnboardingSurveyChoiceStep {...defaultProps} />);
      expect(queryByText(/Question #/)).toBeNull();
    });
  });

  describe('ナンバーバッジ', () => {
    it('各選択肢に番号バッジ（1, 2, 3）が表示される', () => {
      const { getByText } = render(<OnboardingSurveyChoiceStep {...defaultProps} />);
      expect(getByText('1')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });

    it('選択済みの選択肢はチェックマークアイコンが表示される', () => {
      const { getByTestId } = render(
        <OnboardingSurveyChoiceStep {...defaultProps} selectedValue="tiktok" />
      );
      expect(getByTestId('badge-checkmark-1')).toBeTruthy();
    });
  });

  describe('ピルスタイル', () => {
    it('各ピルに testID="option-pill-{index}" が存在する', () => {
      const { getByTestId } = render(<OnboardingSurveyChoiceStep {...defaultProps} />);
      expect(getByTestId('option-pill-0')).toBeTruthy();
      expect(getByTestId('option-pill-1')).toBeTruthy();
      expect(getByTestId('option-pill-2')).toBeTruthy();
    });
  });

  describe('インタラクション', () => {
    it('選択肢をタップするとonSelectが値付きで呼ばれる', () => {
      const onSelect = jest.fn();
      const { getByText } = render(
        <OnboardingSurveyChoiceStep {...defaultProps} onSelect={onSelect} />
      );
      fireEvent.press(getByText('survey.discoveryChannel.tiktok'));
      expect(onSelect).toHaveBeenCalledWith('tiktok');
    });
  });
});
