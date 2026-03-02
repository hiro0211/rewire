import React from 'react';
import { render, act } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props: any) => <View {...props} /> };
});

let mockUser: any = null;
const mockSetUser = jest.fn().mockResolvedValue(undefined);
const mockUpdateUser = jest.fn().mockResolvedValue(undefined);

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: mockUser,
    setUser: mockSetUser,
    updateUser: mockUpdateUser,
  }),
}));

import { BrandScreen } from '../brand';

describe('BrandScreen DEVモード', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUser = null;
    (global as any).__DEV__ = true;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('__DEV__でuser=null → ダミーユーザー作成して/(tabs)に遷移する', async () => {
    mockUser = null;
    render(<BrandScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2800);
    });

    expect(mockSetUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'dev-user',
        nickname: 'Dev',
        goalDays: 30,
        isPro: true,
      })
    );
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('__DEV__でnickname未設定 → ダミーユーザー作成して/(tabs)に遷移する', async () => {
    mockUser = { nickname: '', isPro: false };
    render(<BrandScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2800);
    });

    expect(mockSetUser).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('__DEV__でisPro=false → updateUserでisPro=trueにして/(tabs)に遷移する', async () => {
    mockUser = { nickname: 'TestUser', isPro: false };
    render(<BrandScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2800);
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({ isPro: true });
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('__DEV__でisPro=true → そのまま/(tabs)に遷移する', async () => {
    mockUser = { nickname: 'TestUser', isPro: true };
    render(<BrandScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2800);
    });

    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });
});
