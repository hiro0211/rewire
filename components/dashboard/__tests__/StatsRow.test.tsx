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
    },
    useFrameCallback: () => {},
    useDerivedValue: (fn: any) => ({ value: fn() }),
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

  it('AnimatedOrbが表示される', () => {
    const { getByTestId } = render(<StatsRow />);
    expect(getByTestId('animated-orb')).toBeTruthy();
  });

  it('オーブ長押しでStreakEditModalが表示される', () => {
    const { getByTestId, getByText } = render(<StatsRow />);
    fireEvent(getByTestId('orb-touch'), 'onLongPress');
    expect(getByText('開始日を編集')).toBeTruthy();
  });

  it('シェアボタンは表示されない', () => {
    const { queryByTestId } = render(<StatsRow />);
    expect(queryByTestId('share-button')).toBeNull();
  });
});
