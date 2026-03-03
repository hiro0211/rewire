import React from 'react';
import { render, fireEvent, within } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#E8E8ED', textSecondary: '#6B6B7B', primary: '#8B5CF6' },
    gradients: { hero: ['#1a1a2e', '#16213e', '#0f3460'], button: ['#8B5CF6', '#6D28D9'] },
    glow: { purple: 'rgba(139, 92, 246, 0.3)' },
    isDark: true,
  }),
}));

jest.mock('@/hooks/dashboard/useStreak', () => ({
  useStreak: () => ({ streak: 3, goal: 30 }),
}));

jest.mock('@/components/streak/StreakNumber', () => {
  const { View, Text } = require('react-native');
  return {
    StreakNumber: ({ streak }: any) => (
      <View testID="streak-number"><Text>{streak}</Text></View>
    ),
  };
});

jest.mock('@/components/streak/StreakSubText', () => {
  const { View, Text } = require('react-native');
  return {
    StreakSubText: ({ text }: any) => (
      <View testID="streak-sub-text"><Text>{text}</Text></View>
    ),
  };
});

jest.mock('@/components/streak/WeeklyTracker', () => {
  const { View } = require('react-native');
  return { WeeklyTracker: () => <View testID="weekly-tracker" /> };
});

jest.mock('@/components/streak/ParticleEffect', () => {
  const { View } = require('react-native');
  return { ParticleEffect: () => <View testID="particle-effect" /> };
});

jest.mock('@/components/streak/GlowOverlay', () => {
  const { View } = require('react-native');
  return { GlowOverlay: () => <View testID="glow-overlay" /> };
});

jest.mock('@/components/streak/ConfettiEffect', () => {
  const { View } = require('react-native');
  return { ConfettiEffect: () => <View testID="confetti-effect" /> };
});

jest.mock('@/components/ui/Button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ title, onPress }: any) => (
      <TouchableOpacity testID="continue-button" onPress={onPress}><Text>{title}</Text></TouchableOpacity>
    ),
  };
});

import StreakScreen from '../streak';

describe('StreakScreen DEVモード', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__DEV__ = true;
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
  });

  it('DEVモードでティア切り替えピルが表示される', () => {
    const { getByTestId } = render(<StreakScreen />);
    expect(getByTestId('dev-tier-selector')).toBeTruthy();
  });

  it('5つのプリセットボタンが表示される', () => {
    const { getByTestId } = render(<StreakScreen />);
    const selector = getByTestId('dev-tier-selector');
    expect(within(selector).getByText('Day 3')).toBeTruthy();
    expect(within(selector).getByText('Week(7)')).toBeTruthy();
    expect(within(selector).getByText('Month(30)')).toBeTruthy();
    expect(within(selector).getByText('90日(90)')).toBeTruthy();
    expect(within(selector).getByText('Goal達成')).toBeTruthy();
  });

  it('ピル選択でstreakが切り替わる', () => {
    const { getByTestId } = render(<StreakScreen />);
    const selector = getByTestId('dev-tier-selector');

    fireEvent.press(within(selector).getByText('Week(7)'));
    expect(within(getByTestId('streak-number')).getByText('7')).toBeTruthy();
  });

  it('Goal達成を選択するとゴール達成演出になる', () => {
    const { getByTestId } = render(<StreakScreen />);
    const selector = getByTestId('dev-tier-selector');

    fireEvent.press(within(selector).getByText('Goal達成'));
    expect(getByTestId('confetti-effect')).toBeTruthy();
  });

  it('本番モードではティア切り替えピルが表示されない', () => {
    (global as any).__DEV__ = false;
    const { queryByTestId } = render(<StreakScreen />);
    expect(queryByTestId('dev-tier-selector')).toBeNull();
  });
});
