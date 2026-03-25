import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    useAnimatedProps: () => ({}),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    withRepeat: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { out: (f: any) => f, quad: (v: number) => v },
    FadeIn: { duration: () => ({ duration: jest.fn().mockReturnThis() }) },
    SlideInUp: {
      springify: () => ({
        damping: () => ({
          stiffness: jest.fn().mockReturnThis(),
        }),
      }),
    },
  };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Polyline: () => <View />,
    Circle: () => <View />,
    Path: () => <View />,
    Line: () => <View />,
  };
});

// Mock Sparkline to avoid SVG + reanimated complexity
jest.mock('@/components/ui/Sparkline', () => ({
  Sparkline: () => {
    const { View } = require('react-native');
    return <View testID="sparkline-mock" />;
  },
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: any) => <Text testID={`icon-${name}`}>{name}</Text>,
  };
});

jest.mock('@/hooks/dashboard/useDashboardStats', () => ({
  useDashboardStats: () => ({
    relapseCount: 1,
    stopwatch: { days: 5, hours: 3, minutes: 10, formatted: '5日3時間10分' },
    goalDays: 30,
    streakStartDate: '2026-03-18',
  }),
}));

jest.mock('@/hooks/dashboard/useCheckinTrends', () => ({
  useCheckinTrends: () => ({
    urgeLevel: [0, 1, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 1],
    stressLevel: [1, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 1, 0],
    qualityOfLife: [3, 4, 3, 5, 4, 3, 4, 5, 4, 3, 4, 5, 3, 4],
  }),
}));

import { StatsDetailModal } from '../StatsDetailModal';

const mockClose = jest.fn();

describe('StatsDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('visible=false のとき何もレンダリングしない', () => {
    const { toJSON } = render(
      <StatsDetailModal visible={false} onClose={mockClose} />
    );
    expect(toJSON()).toBeNull();
  });

  it('visible=true のとき表示される', () => {
    const { getByText } = render(
      <StatsDetailModal visible={true} onClose={mockClose} />
    );
    expect(getByText('現在の記録')).toBeTruthy();
  });

  it('ストリーク値が表示される', () => {
    const { getByText } = render(
      <StatsDetailModal visible={true} onClose={mockClose} />
    );
    expect(getByText('5日3時間10分')).toBeTruthy();
  });

  it('リセット回数が表示される', () => {
    const { getByText } = render(
      <StatsDetailModal visible={true} onClose={mockClose} />
    );
    expect(getByText('リセット回数')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  it('目標日数が表示される', () => {
    const { getByText } = render(
      <StatsDetailModal visible={true} onClose={mockClose} />
    );
    expect(getByText('目標日数')).toBeTruthy();
    expect(getByText('30日')).toBeTruthy();
  });

  it('クローズアイコンが表示される', () => {
    const { getByTestId } = render(
      <StatsDetailModal visible={true} onClose={mockClose} />
    );
    expect(getByTestId('icon-close')).toBeTruthy();
  });

  it('クローズボタンタップで onClose が呼ばれる', () => {
    const { getByTestId } = render(
      <StatsDetailModal visible={true} onClose={mockClose} />
    );
    fireEvent.press(getByTestId('icon-close'));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('スパークラインが3つレンダリングされる', () => {
    const { getAllByTestId } = render(
      <StatsDetailModal visible={true} onClose={mockClose} />
    );
    // 3 sparkline sections: urge, QOL, stress
    expect(getAllByTestId('sparkline-mock').length).toBe(3);
  });

  it('衝動レベル — 14日間 テキストが表示される', () => {
    const { getAllByText } = render(
      <StatsDetailModal visible={true} onClose={mockClose} />
    );
    expect(getAllByText(/14日間/).length).toBeGreaterThanOrEqual(1);
  });

  it('ストレス — 14日間 テキストが表示される', () => {
    const { getByText } = render(
      <StatsDetailModal visible={true} onClose={mockClose} />
    );
    expect(getByText(/ストレス/)).toBeTruthy();
  });
});
