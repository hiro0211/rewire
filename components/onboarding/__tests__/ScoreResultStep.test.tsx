import React from 'react';
import { render } from '@testing-library/react-native';
import { ScoreResultStep } from '../ScoreResultStep';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

jest.mock('@/lib/assessment/scoreCalculator', () => ({
  getScoreLevel: (score: number) => {
    if (score <= 7) return { labelKey: 'assessment.score.low.label', color: '#3DD68C', messageKey: 'assessment.score.low.message' };
    if (score <= 14) return { labelKey: 'assessment.score.moderate.label', color: '#F0A030', messageKey: 'assessment.score.moderate.message' };
    if (score <= 21) return { labelKey: 'assessment.score.high.label', color: '#EF8C30', messageKey: 'assessment.score.high.message' };
    return { labelKey: 'assessment.score.severe.label', color: '#EF4444', messageKey: 'assessment.score.severe.message' };
  },
}));

describe('ScoreResultStep', () => {
  it('"分析完了" テキストが表示される', () => {
    const { getByText } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByText('scoreResult.analysisComplete')).toBeTruthy();
  });

  it('testID="score-bar-yours" が存在する', () => {
    const { getByTestId } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByTestId('score-bar-yours')).toBeTruthy();
  });

  it('testID="score-bar-average" が存在する', () => {
    const { getByTestId } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByTestId('score-bar-average')).toBeTruthy();
  });

  it('スコアに基づくレベルメッセージキーが表示される', () => {
    const { getByText } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByText('assessment.score.high.message')).toBeTruthy();
  });

  it('score=15, maxScore=29 で正しいレベルキーが適用される', () => {
    const { getByText } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByText('assessment.score.high.label')).toBeTruthy();
  });

  it('クラッシュしない', () => {
    expect(() => render(<ScoreResultStep score={5} maxScore={29} />)).not.toThrow();
  });
});
