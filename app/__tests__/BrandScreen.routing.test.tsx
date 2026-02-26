import React from 'react';
import { render, act } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children }: any) => <View>{children}</View>,
  };
});

let mockUser: any = null;
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: mockUser }),
}));

import { BrandScreen } from '../brand';

describe('BrandScreen routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUser = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('user=nullの場合/onboardingに遷移する', () => {
    mockUser = null;
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(2800); });

    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nickname=nullの場合/onboardingに遷移する', () => {
    mockUser = { nickname: null, isPro: false };
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(2800); });

    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nickname未設定(空)の場合/onboardingに遷移する', () => {
    mockUser = { nickname: '', isPro: false };
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(2800); });

    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('nicknameあり+isPro=falseの場合/paywall?source=onboardingに遷移する', () => {
    mockUser = { nickname: 'TestUser', isPro: false };
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(2800); });

    expect(mockReplace).toHaveBeenCalledWith('/paywall?source=onboarding');
  });

  it('nicknameあり+isPro=trueの場合/(tabs)に遷移する', () => {
    mockUser = { nickname: 'TestUser', isPro: true };
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(2800); });

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('2800ms前には遷移しない', () => {
    mockUser = null;
    render(<BrandScreen />);

    act(() => { jest.advanceTimersByTime(2799); });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
