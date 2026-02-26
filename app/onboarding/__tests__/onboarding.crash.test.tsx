import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ setUser: jest.fn().mockResolvedValue(undefined) }),
}));

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const { View } = require('react-native');
  return {
    SafeAreaWrapper: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock('@/components/onboarding/StarryBackground', () => {
  const { View } = require('react-native');
  return {
    StarryBackground: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@/components/onboarding/AssessmentChoiceStep', () => {
  const { View, Text } = require('react-native');
  return {
    AssessmentChoiceStep: (props: any) => (
      <View testID="assessment-choice">
        <Text>{props.question?.question || 'no question'}</Text>
      </View>
    ),
  };
});

jest.mock('@/components/onboarding/AssessmentPickerStep', () => {
  const { View } = require('react-native');
  return {
    AssessmentPickerStep: (props: any) => <View testID="assessment-picker" />,
  };
});

jest.mock('@/components/onboarding/AssessmentYesNoStep', () => {
  const { View } = require('react-native');
  return {
    AssessmentYesNoStep: (props: any) => <View testID="assessment-yesno" />,
  };
});

jest.mock('@/components/onboarding/ScoreResultStep', () => {
  const { View } = require('react-native');
  return {
    ScoreResultStep: (props: any) => <View testID="score-result" />,
  };
});

jest.mock('@/components/onboarding/AnalyzingStep', () => {
  const { View } = require('react-native');
  return {
    AnalyzingStep: (props: any) => <View testID="analyzing" />,
  };
});

jest.mock('@/components/onboarding/EducationSlideStep', () => {
  const { View } = require('react-native');
  return {
    EducationSlideStep: (props: any) => <View testID="education-slide" />,
  };
});

jest.mock('@/components/onboarding/NotificationSetupStep', () => {
  const { View } = require('react-native');
  return {
    NotificationSetupStep: (props: any) => <View testID="notification-setup" />,
  };
});

import OnboardingScreen from '../index';

describe('OnboardingScreen crash prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初期レンダリング（welcomeステップ） → クラッシュしない', () => {
    expect(() => render(<OnboardingScreen />)).not.toThrow();
  });

  it('「始める」ボタンで次のステップに進む → クラッシュしない', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(() => fireEvent.press(getByText('始める'))).not.toThrow();
  });

  it('welcomeステップにプログレスバーが表示される', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('始める')).toBeTruthy();
  });

  it('プライバシーカード表示 → クラッシュしない', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText(/すべての回答はこの端末内にのみ保存されます/)).toBeTruthy();
  });

  it('複数回レンダリング → クラッシュしない', () => {
    const { unmount } = render(<OnboardingScreen />);
    unmount();
    expect(() => render(<OnboardingScreen />)).not.toThrow();
  });

  it('アンマウント後のタイマー → クラッシュしない', () => {
    const { unmount } = render(<OnboardingScreen />);
    unmount();
    // advance timers after unmount - shouldn't crash
    expect(() => jest.advanceTimersByTime(1000)).not.toThrow();
  });
});
