import React from 'react';
import { render } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = require('react');
    useEffect(() => { cb(); }, []);
  },
}));

const mockLoadUser = jest.fn().mockResolvedValue(undefined);
let mockUser: any = {
  nickname: 'TestUser',
  goalDays: 30,
  streakStartDate: '2025-01-01',
  isPro: true,
  notifyEnabled: true,
  notifyTime: '22:00',
};

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: mockUser,
    loadUser: mockLoadUser,
  }),
}));

const mockLoadCheckins = jest.fn().mockResolvedValue(undefined);
let mockTodayCheckin: any = null;
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: () => ({
    loadCheckins: mockLoadCheckins,
    todayCheckin: mockTodayCheckin,
  }),
}));

jest.mock('@/components/dashboard/StatsRow', () => {
  const { View, Text } = require('react-native');
  return { StatsRow: () => <View><Text>StatsRow</Text></View> };
});

jest.mock('@/components/dashboard/SOSButton', () => {
  const { View, Text } = require('react-native');
  return { SOSButton: () => <View><Text>SOSButton</Text></View> };
});

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const { View } = require('react-native');
  return { SafeAreaWrapper: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: any) => <Text>{name}</Text> };
});

import DashboardScreen from '../../app/(tabs)/index';

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      nickname: 'TestUser',
      goalDays: 30,
      streakStartDate: '2025-01-01',
      isPro: true,
      notifyEnabled: true,
      notifyTime: '22:00',
    };
    mockTodayCheckin = null;
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('挨拶とニックネームが表示される', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('おかえりなさい')).toBeTruthy();
    expect(getByText('TestUser')).toBeTruthy();
  });

  it('チェックイン未完了時に「今日の結果を入力」ボタンが表示される', () => {
    mockTodayCheckin = null;
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('今日の結果を入力')).toBeTruthy();
  });

  it('チェックイン完了時に「完了済み」が表示される', () => {
    mockTodayCheckin = {
      id: '1',
      date: '2025-01-01',
      watchedPorn: false,
      urgeLevel: 2,
      stressLevel: 2,
      qualityOfLife: 3,
      memo: '',
      createdAt: '2025-01-01',
    };
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('完了済み')).toBeTruthy();
    expect(getByText('やり直す')).toBeTruthy();
  });

  it('useFocusEffectでloadCheckinsとloadUserが呼ばれる', () => {
    render(<DashboardScreen />);
    expect(mockLoadCheckins).toHaveBeenCalled();
    expect(mockLoadUser).toHaveBeenCalled();
  });

  it('ユーザーがnullでもクラッシュしない', () => {
    mockUser = null;
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it('ニックネームがundefinedでもクラッシュしない', () => {
    mockUser = { ...mockUser, nickname: undefined };
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });
});
