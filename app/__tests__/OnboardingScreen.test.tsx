import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    setUser: jest.fn(),
  }),
}));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Picker = ({ children }: any) => <View testID="picker">{children}</View>;
  Picker.Item = ({ label }: any) => <Text>{label}</Text>;
  return { Picker };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Svg: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Circle: (props: any) => <View {...props} />,
  };
});

import OnboardingScreen from '../onboarding/index';

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Welcome ステップで "始める" ボタンが存在する', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('始める')).toBeTruthy();
  });

  it('Welcome ステップで testID="starry-background" が存在する', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    expect(getByTestId('starry-background')).toBeTruthy();
  });

  it('"始める" を押すと次のステップに遷移する', () => {
    const { getByText } = render(<OnboardingScreen />);
    act(() => {
      fireEvent.press(getByText('始める'));
      jest.advanceTimersByTime(500);
    });
    expect(getByText('Question #1')).toBeTruthy();
  });

  it('assessment ステップで "Question #" フォーマットが使われる', () => {
    const { getByText } = render(<OnboardingScreen />);
    act(() => {
      fireEvent.press(getByText('始める'));
      jest.advanceTimersByTime(500);
    });
    expect(getByText(/Question #/)).toBeTruthy();
  });
});
