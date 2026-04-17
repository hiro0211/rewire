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
    withDelay: (_d: any, v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: {
      out: (f: any) => f,
      inOut: (f: any) => f,
      cubic: (v: number) => v,
      sin: (v: number) => v,
      quad: (v: number) => v,
    },
    useFrameCallback: () => {},
    useAnimatedReaction: () => {},
    useDerivedValue: (fn: any) => ({ value: fn() }),
  };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View {...props} />,
    Svg: (props: any) => <View {...props} />,
    Defs: (props: any) => <View {...props} />,
    RadialGradient: (props: any) => <View {...props} />,
    Stop: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
  };
});

const mockUpdateUser = jest.fn();

jest.mock('@/hooks/dashboard/useDashboardStats', () => ({
  useDashboardStats: () => ({
    relapseCount: 2,
    stopwatch: { days: 2, hours: 15, minutes: 31, formatted: '2日15時間31分' },
    goalDays: 90,
    streakStartDate: '2026-02-24T19:00:00Z',
  }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: { streakStartDate: '2026-02-24T19:00:00Z', goalDays: 90 },
    updateUser: mockUpdateUser,
  }),
}));

import { StatsRow } from '../StatsRow';

describe('StatsRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stats-rowコンテナが表示される', () => {
    const { getByTestId } = render(<StatsRow />);
    expect(getByTestId('stats-row')).toBeTruthy();
  });

  it('OrbCarouselが表示される', () => {
    const { getByTestId } = render(<StatsRow />);
    expect(getByTestId('orb-carousel')).toBeTruthy();
  });

  it('アクティブオーブ長押しでStreakEditModalが表示される', () => {
    const { getByTestId, getByText } = render(<StatsRow />);
    fireEvent(getByTestId('orb-carousel-item-active-touch'), 'onLongPress');
    expect(getByText('開始日を編集')).toBeTruthy();
  });

  it('シェアボタンは表示されない', () => {
    const { queryByTestId } = render(<StatsRow />);
    expect(queryByTestId('share-button')).toBeNull();
  });
});
