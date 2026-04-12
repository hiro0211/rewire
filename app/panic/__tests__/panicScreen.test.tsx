import React from 'react';
import { render, fireEvent, within } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'panic.title': 'パニックボタン',
        'panic.sideEffectsTitle': 'ポルノを見てしまうと？',
        'panic.thinkingOfWatching': '⚠️ 見そうになっている',
        'panic.watchedPorn': '👎 ポルノを見てしまった',
        'panic.cameraPrompt': 'カメラを有効にする',
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#000',
      contrastText: '#FFFFFF',
      text: '#FFFFFF',
    },
  }),
}));

jest.mock('@/hooks/panic/useCameraPermission', () => ({
  useCameraPermission: () => ({
    hasPermission: false,
    isLoading: false,
    requestPermission: jest.fn(),
  }),
}));

jest.mock('@/hooks/panic/useTypewriterMessage', () => ({
  useTypewriterMessage: () => ({ displayedText: '', phase: 'entering' }),
}));

jest.mock('expo-camera', () => {
  const { View } = require('react-native');
  return { CameraView: View };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: { View, Text },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    withTiming: (v: any) => v,
    Easing: { in: (fn: any) => fn, out: (fn: any) => fn, quad: () => 0 },
  };
});

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

import PanicScreen from '../index';

describe('PanicScreen', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockBack.mockReset();
  });

  it('2つのアクションボタンと副作用見出しを表示する', () => {
    const { getByText } = render(<PanicScreen />);
    expect(getByText('ポルノを見てしまうと？')).toBeTruthy();
    expect(getByText('⚠️ 見そうになっている')).toBeTruthy();
    expect(getByText('👎 ポルノを見てしまった')).toBeTruthy();
  });

  it('赤ボタン押下で /breathing に遷移する', () => {
    const { getByTestId } = render(<PanicScreen />);
    fireEvent.press(getByTestId('panic-action-thinking'));
    expect(mockPush).toHaveBeenCalledWith('/breathing');
  });

  it('紺ボタン押下で /recovery に遷移する', () => {
    const { getByTestId } = render(<PanicScreen />);
    fireEvent.press(getByTestId('panic-action-watched'));
    expect(mockPush).toHaveBeenCalledWith('/recovery');
  });

  it('閉じるボタン押下で router.back が呼ばれる', () => {
    const { getByTestId } = render(<PanicScreen />);
    fireEvent.press(getByTestId('panic-header-close'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('アクションボタンが ScrollView の外に配置されている', () => {
    const { getByTestId } = render(<PanicScreen />);
    const scrollView = getByTestId('panic-scroll-view');
    expect(
      within(scrollView).queryByTestId('panic-action-thinking'),
    ).toBeNull();
    expect(
      within(scrollView).queryByTestId('panic-action-watched'),
    ).toBeNull();
    // ツリー全体には存在する
    expect(getByTestId('panic-action-thinking')).toBeTruthy();
  });
});
