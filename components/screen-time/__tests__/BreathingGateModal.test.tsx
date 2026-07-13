import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

let mockGateState = {
  phase: 'inhale' as string,
  cycleCount: 0,
  done: false,
};
jest.mock('@/hooks/screenTime/useBreathingGate', () => ({
  useBreathingGate: () => mockGateState,
}));

jest.mock('@/components/breathing/BreathingCircle', () => {
  const { View } = require('react-native');
  return {
    BreathingCircle: () => <View testID="breathing-circle" />,
  };
});

jest.mock('@/components/breathing/BreathingText', () => {
  const { View } = require('react-native');
  return {
    BreathingText: () => <View testID="breathing-text" />,
  };
});

jest.mock('@/components/breathing/BreathingTimer', () => {
  const { View } = require('react-native');
  return {
    BreathingTimer: () => <View testID="breathing-timer" />,
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#0A0A0F',
      surface: '#1a1a1a',
      text: '#fff',
      textSecondary: '#aaa',
      primary: '#8B5CF6',
    },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (k: string) => k }),
}));

jest.mock('@/components/ui/Button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ title, onPress }: { title: string; onPress: () => void }) => (
      <TouchableOpacity testID={`button-${title}`} onPress={onPress}>
        <Text>{title}</Text>
      </TouchableOpacity>
    ),
  };
});

import { BreathingGateModal } from '../BreathingGateModal';

describe('BreathingGateModal（全画面・既存呼吸デザイン再利用）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGateState = { phase: 'inhale', cycleCount: 0, done: false };
  });

  it('visible=false のとき何も表示しない', () => {
    const { queryByTestId } = render(
      <BreathingGateModal visible={false} onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(queryByTestId('breathing-gate-modal')).toBeNull();
  });

  it('呼吸中: 既存の呼吸UI（サークル・案内文・タイマー）を表示する', () => {
    const { getByTestId } = render(
      <BreathingGateModal visible onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(getByTestId('breathing-circle')).toBeTruthy();
    expect(getByTestId('breathing-text')).toBeTruthy();
    expect(getByTestId('breathing-timer')).toBeTruthy();
  });

  it('呼吸中でも右上の×でやめられる（onCancel）', () => {
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <BreathingGateModal visible onConfirm={jest.fn()} onCancel={onCancel} />,
    );
    fireEvent.press(getByTestId('breathing-gate-close'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('呼吸中は確認ボタンを表示しない', () => {
    const { queryByTestId } = render(
      <BreathingGateModal visible onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(queryByTestId('button-contentBlocker.breathingGate.turnOff')).toBeNull();
    expect(queryByTestId('button-contentBlocker.breathingGate.keepProtection')).toBeNull();
  });

  it('3回完了後: 確認タイトルと2つのボタンを表示する', () => {
    mockGateState = { phase: 'complete', cycleCount: 3, done: true };
    const { getByText, getByTestId } = render(
      <BreathingGateModal visible onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(getByText('contentBlocker.breathingGate.confirmTitle')).toBeTruthy();
    expect(getByTestId('button-contentBlocker.breathingGate.turnOff')).toBeTruthy();
    expect(getByTestId('button-contentBlocker.breathingGate.keepProtection')).toBeTruthy();
  });

  it('「オフにする」タップで onConfirm を呼ぶ', () => {
    mockGateState = { phase: 'complete', cycleCount: 3, done: true };
    const onConfirm = jest.fn();
    const { getByTestId } = render(
      <BreathingGateModal visible onConfirm={onConfirm} onCancel={jest.fn()} />,
    );
    fireEvent.press(getByTestId('button-contentBlocker.breathingGate.turnOff'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('「保護を続ける」タップで onCancel を呼ぶ', () => {
    mockGateState = { phase: 'complete', cycleCount: 3, done: true };
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <BreathingGateModal visible onConfirm={jest.fn()} onCancel={onCancel} />,
    );
    fireEvent.press(getByTestId('button-contentBlocker.breathingGate.keepProtection'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('確認画面でも右上の×でやめられる', () => {
    mockGateState = { phase: 'complete', cycleCount: 3, done: true };
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <BreathingGateModal visible onConfirm={jest.fn()} onCancel={onCancel} />,
    );
    fireEvent.press(getByTestId('breathing-gate-close'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
