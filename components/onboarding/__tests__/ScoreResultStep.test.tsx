import React from 'react';
import { render } from '@testing-library/react-native';
import { ScoreResultStep } from '../ScoreResultStep';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>{children}</View>
    ),
  };
});

jest.mock('@/lib/assessment/scoreCalculator', () => ({
  getScoreLevel: (score: number) => {
    if (score <= 7) return { label: '影響 小', color: '#3DD68C', message: '大きな問題はなさそうです。' };
    if (score <= 14) return { label: '影響 中', color: '#F0A030', message: '習慣が日常に影響し始めています。' };
    if (score <= 21) return { label: '影響 大', color: '#EF8C30', message: '習慣があなたの時間と集中力を奪っています。' };
    return { label: '影響 深刻', color: '#EF4444', message: '正しいアプローチで、確実に変えられます。' };
  },
}));

describe('ScoreResultStep', () => {
  it('"分析完了" テキストが表示される', () => {
    const { getByText } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByText('分析完了')).toBeTruthy();
  });

  it('testID="score-bar-yours" が存在する', () => {
    const { getByTestId } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByTestId('score-bar-yours')).toBeTruthy();
  });

  it('testID="score-bar-average" が存在する', () => {
    const { getByTestId } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByTestId('score-bar-average')).toBeTruthy();
  });

  it('スコアに基づくレベルメッセージが表示される', () => {
    const { getByText } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByText(/習慣があなたの時間/)).toBeTruthy();
  });

  it('score=15, maxScore=29 で正しいレベル色が適用される', () => {
    const { getByText } = render(<ScoreResultStep score={15} maxScore={29} />);
    expect(getByText('影響 大')).toBeTruthy();
  });

  it('クラッシュしない', () => {
    expect(() => render(<ScoreResultStep score={5} maxScore={29} />)).not.toThrow();
  });
});
