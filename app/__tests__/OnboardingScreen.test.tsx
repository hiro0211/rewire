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

jest.mock('@/components/ui/AuroraBackground', () => {
  const { View } = require('react-native');
  return {
    AuroraBackground: ({ children }: any) => (
      <View testID="aurora-container">{children}</View>
    ),
  };
});

jest.mock('@/components/ui/StarryOverlay', () => {
  const { View } = require('react-native');
  return {
    StarryOverlay: () => <View testID="starry-overlay" />,
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

  it('Welcome ステップで "チェックを始める" ボタンが存在する', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('チェックを始める')).toBeTruthy();
  });

  it('Welcome ステップで testID="aurora-container" が存在する', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    expect(getByTestId('aurora-container')).toBeTruthy();
  });

  it('"チェックを始める" を押すと最初のオンボーディング調査の質問に遷移する', () => {
    const { getByText } = render(<OnboardingScreen />);
    act(() => {
      fireEvent.press(getByText('チェックを始める'));
      jest.advanceTimersByTime(500);
    });
    expect(getByText('あなたの年齢を教えてください')).toBeTruthy();
  });

  it('調査ステップにはスキップ操作がある', () => {
    const { getByText } = render(<OnboardingScreen />);
    act(() => {
      fireEvent.press(getByText('チェックを始める'));
      jest.advanceTimersByTime(500);
    });
    expect(getByText('スキップ')).toBeTruthy();
  });

  it('調査をスキップすると assessment の1問目へ進む', () => {
    const { getByText } = render(<OnboardingScreen />);
    act(() => {
      fireEvent.press(getByText('チェックを始める'));
      jest.advanceTimersByTime(500);
    });
    act(() => {
      fireEvent.press(getByText('スキップ'));
      jest.advanceTimersByTime(500);
    });
    expect(getByText('Question #1')).toBeTruthy();
  });

  it('調査の選択肢を選ぶと次の調査質問に自動で進む', () => {
    const { getByText } = render(<OnboardingScreen />);
    act(() => {
      fireEvent.press(getByText('チェックを始める'));
      jest.advanceTimersByTime(500);
    });
    act(() => {
      fireEvent.press(getByText('25〜34歳'));
      jest.advanceTimersByTime(1000);
    });
    expect(getByText('このアプリをどこで知りましたか？')).toBeTruthy();
  });

  it('discovery_channel でSNSがプラットフォーム別に表示される', () => {
    const { getByText } = render(<OnboardingScreen />);
    act(() => {
      fireEvent.press(getByText('チェックを始める'));
      jest.advanceTimersByTime(500);
    });
    act(() => {
      fireEvent.press(getByText('25〜34歳'));
      jest.advanceTimersByTime(1000);
    });
    expect(getByText('TikTok')).toBeTruthy();
    expect(getByText('Instagram')).toBeTruthy();
    expect(getByText('YouTube')).toBeTruthy();
    expect(getByText('X（旧Twitter）')).toBeTruthy();
  });

  it('assessment ステップで "Question #" フォーマットが使われる', () => {
    const { getByText } = render(<OnboardingScreen />);
    act(() => {
      fireEvent.press(getByText('チェックを始める'));
      jest.advanceTimersByTime(500);
    });
    act(() => {
      fireEvent.press(getByText('スキップ'));
      jest.advanceTimersByTime(500);
    });
    expect(getByText(/Question #/)).toBeTruthy();
  });
});
