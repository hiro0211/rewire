import React from 'react';
import { render } from '@testing-library/react-native';

let capturedCurrentDays: number | null = null;

jest.mock('../OrbCarousel', () => {
  const { Text } = require('react-native');
  return {
    OrbCarousel: (props: { currentDays: number }) => {
      capturedCurrentDays = props.currentDays;
      return <Text testID="orb-carousel-mock">{props.currentDays}</Text>;
    },
  };
});

jest.mock('../StreakEditModal', () => ({
  StreakEditModal: () => null,
}));

jest.mock('@/hooks/dashboard/useDashboardStats', () => ({
  useDashboardStats: () => ({
    stopwatch: { days: 2 },
    streakStartDate: '2026-02-24T19:00:00Z',
  }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ updateUser: jest.fn() }),
}));

const mockUseDebugUnlockAll = jest.fn<boolean, []>(() => false);
jest.mock('@/hooks/debug/useDebugUnlockAll', () => ({
  useDebugUnlockAll: () => mockUseDebugUnlockAll(),
}));

import { StatsRow } from '../StatsRow';
import { DEBUG_UNLOCK_DAYS } from '@/constants/debug';

describe('StatsRow — デバッグ全解放', () => {
  beforeEach(() => {
    capturedCurrentDays = null;
    mockUseDebugUnlockAll.mockReturnValue(false);
  });

  it('デバッグ無効時は実際のストリーク日数を渡す', () => {
    render(<StatsRow />);
    expect(capturedCurrentDays).toBe(2);
  });

  it('デバッグ有効時は DEBUG_UNLOCK_DAYS を渡して全バッジを解放する', () => {
    mockUseDebugUnlockAll.mockReturnValue(true);
    render(<StatsRow />);
    expect(capturedCurrentDays).toBe(DEBUG_UNLOCK_DAYS);
  });
});
