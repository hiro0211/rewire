import React from 'react';
import { render, act } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props: any) => <View {...props} /> };
});

let mockUser: any = null;
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: mockUser }),
}));

import { BrandScreen } from '../brand';

describe('BrandScreen ルーティング分岐', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ユーザーがnull → /onboarding', () => {
    mockUser = null;
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nicknameが空文字 → /onboarding', () => {
    mockUser = { nickname: '' };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nicknameがnull → /onboarding', () => {
    mockUser = { nickname: null };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('isPro=false → /paywall?source=onboarding', () => {
    mockUser = { nickname: 'Test', isPro: false };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(mockReplace).toHaveBeenCalledWith('/paywall?source=onboarding');
  });

  it('isPro=undefined → /paywall?source=onboarding（falsy扱い）', () => {
    mockUser = { nickname: 'Test' };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(mockReplace).toHaveBeenCalledWith('/paywall?source=onboarding');
  });

  it('isPro=true → /(tabs)', () => {
    mockUser = { nickname: 'Test', isPro: true };
    render(<BrandScreen />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });
});
