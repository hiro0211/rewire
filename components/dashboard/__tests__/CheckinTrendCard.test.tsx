import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View testID="svg-root" {...props}>{children}</View>,
    Path: (props: any) => <View testID="svg-path" />,
    Circle: (props: any) => <View testID="svg-circle" />,
    Line: (props: any) => <View testID="svg-line" />,
    Text: ({ children }: any) => <Text>{children}</Text>,
    Polyline: (props: any) => <View testID="svg-polyline" />,
  };
});

const mockCheckins: any[] = [];
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: () => ({ checkins: mockCheckins }),
}));

import { CheckinTrendCard } from '../CheckinTrendCard';

describe('CheckinTrendCard', () => {
  beforeEach(() => {
    mockCheckins.length = 0;
  });

  it('クラッシュしない', () => {
    expect(() => render(<CheckinTrendCard />)).not.toThrow();
  });

  it('チャートタイトルが表示される', () => {
    const { getByText } = render(<CheckinTrendCard />);
    // i18n key: dashboard.trendChart → 'トレンドチャート'
    expect(getByText('トレンドチャート')).toBeTruthy();
  });

  it('QOL レジェンドが表示される', () => {
    const { getByText } = render(<CheckinTrendCard />);
    expect(getByText('QOL')).toBeTruthy();
  });

  it('SVG がレンダリングされる', () => {
    const { getByTestId } = render(<CheckinTrendCard />);
    expect(getByTestId('svg-root')).toBeTruthy();
  });

  it('days プロパティを指定してもクラッシュしない', () => {
    expect(() => render(<CheckinTrendCard days={7} />)).not.toThrow();
  });

  it('チェックインデータがあってもクラッシュしない', () => {
    mockCheckins.push({
      date: '2026-03-23',
      urgeLevel: 2,
      stressLevel: 1,
      qualityOfLife: 4,
      watchedPorn: false,
    });
    expect(() => render(<CheckinTrendCard />)).not.toThrow();
  });

  it('衝動レベルの凡例テキストが表示される', () => {
    const { getByText } = render(<CheckinTrendCard />);
    // i18n key: checkinForm.urgeLevel → '❷ 誘惑レベル'
    expect(getByText(/誘惑レベル/)).toBeTruthy();
  });

  it('days=7 で7日分のデータでレンダリングされる', () => {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    mockCheckins.push({
      date: fmt(today),
      urgeLevel: 3,
      stressLevel: 2,
      qualityOfLife: 5,
      watchedPorn: false,
    });
    expect(() => render(<CheckinTrendCard days={7} />)).not.toThrow();
  });
});
