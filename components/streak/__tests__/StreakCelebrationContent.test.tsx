import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Animated = {
    View: React.forwardRef(({ testID, style, children }: any, ref: any) => (
      <View testID={testID} style={style} ref={ref}>{children}</View>
    )),
    Text: React.forwardRef(({ testID, style, children }: any, ref: any) => (
      <View testID={testID} style={style} ref={ref}>{children}</View>
    )),
    createAnimatedComponent: (Component: any) =>
      React.forwardRef((props: any, ref: any) => {
        const { animatedProps, ...rest } = props;
        return <Component {...rest} {...animatedProps} ref={ref} />;
      }),
  };

  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue: (val: number) => ({ value: val }),
    useAnimatedProps: (fn: () => any) => fn(),
    useAnimatedStyle: (fn: () => any) => fn(),
    withTiming: (val: number) => val,
    withSequence: (...args: any[]) => args[args.length - 1],
    withSpring: (val: number) => val,
    withDelay: (_d: number, val: any) => val,
    withRepeat: (val: number) => val,
    Easing: { out: (e: any) => e, cubic: (t: number) => t, inOut: (e: any) => e, ease: (t: number) => t, quad: (t: number) => t },
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      background: '#000',
      cyan: '#00ffff',
      contrastText: '#fff',
      surface: '#111',
      surfaceHighlight: '#222',
      border: '#333',
      success: '#0f0',
      primary: '#8B5CF6',
    },
    gradients: { button: ['#8B5CF6', '#6D28D9'], hero: ['#1a0b2e', '#2d1b4e'] },
    glow: { purple: 'rgba(139, 92, 246, 0.3)' },
    shadows: { glowCard: {} },
    isDark: true,
  }),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  impactAsync: jest.fn(),
}));

jest.mock('@/components/streak/WeeklyTracker', () => ({
  WeeklyTracker: () => {
    const { View } = require('react-native');
    return <View testID="weekly-tracker" />;
  },
}));

jest.mock('@/components/streak/ParticleEffect', () => ({
  ParticleEffect: () => {
    const { View } = require('react-native');
    return <View testID="particle-effect" />;
  },
}));

jest.mock('@/components/streak/ConfettiEffect', () => ({
  ConfettiEffect: () => {
    const { View } = require('react-native');
    return <View testID="confetti-effect" />;
  },
}));

jest.mock('@/components/streak/GlowOverlay', () => ({
  GlowOverlay: () => {
    const { View } = require('react-native');
    return <View testID="glow-overlay" />;
  },
}));

import { StreakCelebrationContent } from '../StreakCelebrationContent';

function renderContent(overrides: Partial<React.ComponentProps<typeof StreakCelebrationContent>> = {}) {
  return render(
    <StreakCelebrationContent
      toStreak={10}
      fromStreak={9}
      subText="新しいストリーク"
      continueTitle="続ける"
      onContinue={jest.fn()}
      continueTestID="continue-button"
      {...overrides}
    />,
  );
}

describe('StreakCelebrationContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('大きなストリーク数字が表示される', () => {
    const { getByTestId } = renderContent();
    expect(getByTestId('streak-number')).toBeTruthy();
  });

  it('数字の下のラベル（サブテキスト）が表示される', () => {
    const { getByTestId } = renderContent();
    expect(getByTestId('streak-sub-text')).toBeTruthy();
  });

  it('曜日トラッカーが表示される', () => {
    const { getByTestId } = renderContent();
    expect(getByTestId('weekly-tracker')).toBeTruthy();
  });

  it('Continue ボタンをタップすると onContinue が呼ばれる', () => {
    const onContinue = jest.fn();
    const { getByTestId } = renderContent({ onContinue });
    fireEvent.press(getByTestId('continue-button'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('toStreak=10 (innerPlanets) のとき ParticleEffect のみ表示される', () => {
    const { getByTestId, queryByTestId } = renderContent({ toStreak: 10 });
    expect(getByTestId('particle-effect')).toBeTruthy();
    expect(queryByTestId('glow-overlay')).toBeNull();
    expect(queryByTestId('confetti-effect')).toBeNull();
  });

  it('toStreak=2 (birth) のときエフェクトが表示されない', () => {
    const { queryByTestId } = renderContent({ toStreak: 2, fromStreak: 1 });
    expect(queryByTestId('particle-effect')).toBeNull();
    expect(queryByTestId('glow-overlay')).toBeNull();
    expect(queryByTestId('confetti-effect')).toBeNull();
  });
});
