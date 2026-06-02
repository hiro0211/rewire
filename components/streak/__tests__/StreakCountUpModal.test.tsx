import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, TextInput } = require('react-native');

  const Animated = {
    View: React.forwardRef(({ testID, style, children }: any, ref: any) => (
      <View testID={testID} style={style} ref={ref}>{children}</View>
    )),
    Text: React.forwardRef(({ testID, style, children }: any, ref: any) => (
      <View testID={testID} style={style} ref={ref}>{children}</View>
    )),
    createAnimatedComponent: (Component: any) => {
      return React.forwardRef((props: any, ref: any) => {
        const { animatedProps, ...rest } = props;
        return <Component {...rest} {...animatedProps} ref={ref} />;
      });
    },
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

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.days != null) return `${opts.days}日達成！`;
      return key;
    },
    locale: 'ja' as const,
    isJapanese: true,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/components/streak/WeeklyTracker', () => ({
  WeeklyTracker: () => {
    const { View } = require('react-native');
    return <View testID="weekly-tracker" />;
  },
}));

const mockHaptics = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-haptics', () => ({
  notificationAsync: (...args: any[]) => mockHaptics(...args),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  impactAsync: jest.fn(),
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

import { StreakCountUpModal } from '../StreakCountUpModal';

describe('StreakCountUpModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('visible=false のときはモーダルが表示されない', () => {
    const { queryByTestId } = render(
      <StreakCountUpModal
        visible={false}
        fromStreak={9}
        toStreak={10}
        onDismiss={jest.fn()}
      />,
    );
    expect(queryByTestId('streak-count-up-modal')).toBeNull();
  });

  it('visible=true のときモーダルが表示される', () => {
    const { getByTestId } = render(
      <StreakCountUpModal
        visible={true}
        fromStreak={9}
        toStreak={10}
        onDismiss={jest.fn()}
      />,
    );
    expect(getByTestId('streak-count-up-modal')).toBeTruthy();
    expect(getByTestId('streak-number')).toBeTruthy();
  });

  it('Continue ボタンをタップすると onDismiss が呼ばれる', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <StreakCountUpModal
        visible={true}
        fromStreak={9}
        toStreak={10}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.press(getByTestId('streak-count-up-modal-dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('フルスクリーン演出として WeeklyTracker が表示される', () => {
    const { getByTestId } = render(
      <StreakCountUpModal
        visible={true}
        fromStreak={9}
        toStreak={10}
        onDismiss={jest.fn()}
      />,
    );
    expect(getByTestId('weekly-tracker')).toBeTruthy();
  });

  it('数字の下にラベル（サブテキスト）が表示される', () => {
    const { getByTestId } = render(
      <StreakCountUpModal
        visible={true}
        fromStreak={9}
        toStreak={10}
        onDismiss={jest.fn()}
      />,
    );
    expect(getByTestId('streak-sub-text')).toBeTruthy();
  });

  it('toStreak=10 (innerPlanets) のとき ParticleEffect が表示される', () => {
    // innerPlanets = 7-29日, showParticles=true, showGlow=false, showConfetti=false
    const { getByTestId, queryByTestId } = render(
      <StreakCountUpModal
        visible={true}
        fromStreak={9}
        toStreak={10}
        onDismiss={jest.fn()}
      />,
    );
    expect(getByTestId('particle-effect')).toBeTruthy();
    expect(queryByTestId('glow-overlay')).toBeNull();
    expect(queryByTestId('confetti-effect')).toBeNull();
  });

  it('toStreak=2 (birth) のときはエフェクトが表示されない', () => {
    // birth = 1-6日, 全部 false
    const { queryByTestId } = render(
      <StreakCountUpModal
        visible={true}
        fromStreak={1}
        toStreak={2}
        onDismiss={jest.fn()}
      />,
    );
    expect(queryByTestId('particle-effect')).toBeNull();
    expect(queryByTestId('glow-overlay')).toBeNull();
    expect(queryByTestId('confetti-effect')).toBeNull();
  });

  it('表示時に Haptics.notificationAsync が呼ばれる', () => {
    render(
      <StreakCountUpModal
        visible={true}
        fromStreak={9}
        toStreak={10}
        onDismiss={jest.fn()}
      />,
    );
    expect(mockHaptics).toHaveBeenCalledWith('success');
  });

  it('visible=false → true へ切り替えた時のみ Haptics が発火する', () => {
    const { rerender } = render(
      <StreakCountUpModal
        visible={false}
        fromStreak={9}
        toStreak={10}
        onDismiss={jest.fn()}
      />,
    );
    expect(mockHaptics).not.toHaveBeenCalled();

    rerender(
      <StreakCountUpModal
        visible={true}
        fromStreak={9}
        toStreak={10}
        onDismiss={jest.fn()}
      />,
    );
    expect(mockHaptics).toHaveBeenCalledTimes(1);
  });
});
