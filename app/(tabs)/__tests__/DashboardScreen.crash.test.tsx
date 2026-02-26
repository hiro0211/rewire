import React from 'react';
import { render } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="date-picker" />,
  };
});

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

let mockUser: any = null;
const mockLoadUser = jest.fn();
const mockUpdateUser = jest.fn();
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: mockUser,
    loadUser: mockLoadUser,
    updateUser: mockUpdateUser,
  }),
}));

let mockCheckins: any[] = [];
let mockTodayCheckin: any = null;
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: () => ({
    loadCheckins: jest.fn(),
    todayCheckin: mockTodayCheckin,
    checkins: mockCheckins,
  }),
}));

jest.mock('@/hooks/dashboard/useDashboardStats', () => ({
  useDashboardStats: () => ({
    relapseCount: 0,
    stopwatch: { days: 0, hours: 0, minutes: 0, formatted: '0分' },
    goalDays: 30,
    streakStartDate: null,
  }),
}));

import DashboardScreen from '../index';

describe('DashboardScreen crash prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
    mockCheckins = [];
    mockTodayCheckin = null;
  });

  it('user=null → クラッシュしない', () => {
    mockUser = null;
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('user.nickname=undefined → クラッシュしない', () => {
    mockUser = { goalDays: 30 };
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('user.streakStartDate=null → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30, streakStartDate: null };
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('user.goalDays=0 → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 0, streakStartDate: null };
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('todayCheckin=存在 → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30, streakStartDate: '2026-02-01T00:00:00Z' };
    mockTodayCheckin = {
      id: '1', userId: 'u', date: '2026-02-26', watchedPorn: false,
      urgeLevel: 3, stressLevel: 3, qualityOfLife: 3, createdAt: '',
    };
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('大量のcheckins配列 → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30, streakStartDate: '2026-01-01T00:00:00Z' };
    mockCheckins = Array.from({ length: 365 }, (_, i) => ({
      id: `${i}`, userId: 'u', date: `2025-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
      watchedPorn: i % 7 === 0, urgeLevel: 3, stressLevel: 3, qualityOfLife: 3, createdAt: '',
    }));
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('user.nickname=非常に長い文字列 → クラッシュしない', () => {
    mockUser = { nickname: 'A'.repeat(1000), goalDays: 30, streakStartDate: null };
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('user.streakStartDate=不正な値 → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30, streakStartDate: 'invalid' };
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });
});
