import React from 'react';
import { render } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

jest.mock('@/lib/contentBlocker/contentBlockerBridge', () => ({
  contentBlockerBridge: {
    getBlockerStatus: jest.fn().mockResolvedValue({ isEnabled: false }),
  },
}));

jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: jest.fn().mockResolvedValue(false),
    scheduleDailyReminder: jest.fn(),
    cancelAllNotifications: jest.fn(),
  },
}));

jest.mock('@/components/settings/ProfileEditModal', () => {
  const { View } = require('react-native');
  return { ProfileEditModal: (props: any) => <View testID="profile-modal" /> };
});

jest.mock('@/components/settings/TimePickerModal', () => {
  const { View } = require('react-native');
  return { TimePickerModal: (props: any) => <View testID="time-modal" /> };
});

let mockUser: any = null;
const mockUpdateUser = jest.fn().mockResolvedValue(undefined);
const mockReset = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: mockUser, updateUser: mockUpdateUser, reset: mockReset }),
}));

import SettingsScreen from '../settings';

describe('SettingsScreen crash prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('user=null → 何もレンダリングしない（クラッシュしない）', () => {
    mockUser = null;
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('user=最小限のフィールド → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30 };
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('user.notifyEnabled=true, notifyTime=undefined → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30, notifyEnabled: true, notifyTime: undefined };
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('user.notifyEnabled=false → 通知時間セクション非表示', () => {
    mockUser = { nickname: 'Test', goalDays: 30, notifyEnabled: false };
    const { queryByText } = render(<SettingsScreen />);
    expect(queryByText('通知時間')).toBeNull();
  });

  it('user.notifyEnabled=true, notifyTime=有効 → 通知時間セクション表示', () => {
    mockUser = { nickname: 'Test', goalDays: 30, notifyEnabled: true, notifyTime: '22:00' };
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('通知時間')).toBeTruthy();
  });

  it('全フィールド揃ったuser → 正常レンダリング', () => {
    mockUser = {
      id: 'user-1',
      nickname: 'TestUser',
      goalDays: 90,
      notifyEnabled: true,
      notifyTime: '21:00',
      isPro: true,
      createdAt: '2026-01-01T00:00:00Z',
      streakStartDate: '2026-02-01T00:00:00Z',
    };
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('ニックネーム')).toBeTruthy();
    expect(getByText('目標日数')).toBeTruthy();
  });

  it('goalDays=0 → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 0 };
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });
});
