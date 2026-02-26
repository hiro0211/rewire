import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>{children}</View>
    ),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ setUser: jest.fn() }),
}));

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Svg: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Circle: (props: any) => <View {...props} />,
  };
});

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

// Minimize steps by emptying assessment/education arrays
jest.mock('@/constants/assessment', () => ({
  ASSESSMENT_QUESTIONS: [],
  MAX_SCORE: 0,
}));

jest.mock('@/constants/education', () => ({
  EDUCATION_SLIDES: [],
  EDUCATION_QUIZ: { question: '', correct: 0, options: [] },
  DAMAGE_SLIDES: [],
  RECOVERY_SLIDES: [],
}));

jest.mock('@/lib/assessment/scoreCalculator', () => ({
  calculateScore: () => 0,
  getScoreLevel: () => ({ level: 'low', label: 'テスト', color: '#000' }),
}));

// Auto-complete analyzing step via setTimeout
jest.mock('@/components/onboarding/AnalyzingStep', () => {
  const { useEffect } = require('react');
  const { View } = require('react-native');
  return {
    AnalyzingStep: ({ onComplete }: any) => {
      useEffect(() => {
        const t = setTimeout(onComplete, 10);
        return () => clearTimeout(t);
      }, []);
      return <View />;
    },
  };
});

jest.mock('@react-native-picker/picker', () => {
  const { View, Text } = require('react-native');
  const Picker = ({ children }: any) => <View testID="picker">{children}</View>;
  Picker.Item = ({ label }: any) => <Text>{label}</Text>;
  return { Picker };
});

import OnboardingScreen from '../../onboarding/index';

/**
 * Navigate from welcome to consent step.
 * With mocked empty assessment/education, the steps are:
 *   0:welcome → 1:analyzing → 2:score_result →
 *   3:features → 4:nickname → 5:consent → 6:notification
 */
function navigateToConsent(utils: ReturnType<typeof render>) {
  const { getByText, getByPlaceholderText } = utils;

  // Welcome → "始める"
  act(() => {
    fireEvent.press(getByText('始める'));
    jest.advanceTimersByTime(500);
  });

  // Analyzing → auto-completes via mock setTimeout
  act(() => {
    jest.advanceTimersByTime(500);
  });

  // score_result → "次へ"
  act(() => {
    fireEvent.press(getByText('次へ'));
    jest.advanceTimersByTime(500);
  });

  // features → "次へ"
  act(() => {
    fireEvent.press(getByText('次へ'));
    jest.advanceTimersByTime(500);
  });

  // nickname → enter text + "次へ"
  act(() => {
    fireEvent.changeText(getByPlaceholderText('ニックネーム'), 'テスト');
  });
  act(() => {
    fireEvent.press(getByText('次へ'));
    jest.advanceTimersByTime(500);
  });
}

describe('ConsentStep - リンク表示・動作', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('「プライバシーポリシー」リンクテキストが表示される', () => {
    const utils = render(<OnboardingScreen />);
    navigateToConsent(utils);
    expect(utils.getByTestId('link-privacy-policy')).toBeTruthy();
  });

  it('「利用規約」リンクテキストが表示される', () => {
    const utils = render(<OnboardingScreen />);
    navigateToConsent(utils);
    expect(utils.getByTestId('link-terms')).toBeTruthy();
  });

  it('プライバシーポリシーリンクタップで WebBrowser.openBrowserAsync が正しいURLで呼ばれる', () => {
    const utils = render(<OnboardingScreen />);
    navigateToConsent(utils);
    fireEvent.press(utils.getByTestId('link-privacy-policy'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#privacy'
    );
  });

  it('利用規約リンクタップで WebBrowser.openBrowserAsync が正しいURLで呼ばれる', () => {
    const utils = render(<OnboardingScreen />);
    navigateToConsent(utils);
    fireEvent.press(utils.getByTestId('link-terms'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://hiro0211.github.io/rewire-support/#terms'
    );
  });

  it('チェックボックスのトグル動作が維持される', () => {
    const utils = render(<OnboardingScreen />);
    navigateToConsent(utils);

    // Verify we're at consent step
    expect(utils.getByText('データの取り扱いについて')).toBeTruthy();

    // Toggle both checkboxes
    act(() => {
      fireEvent.press(utils.getByTestId('checkbox-privacy'));
    });
    act(() => {
      fireEvent.press(utils.getByTestId('checkbox-terms'));
    });

    // Both checked → "次へ" advances to notification step
    act(() => {
      fireEvent.press(utils.getByText('次へ'));
      jest.advanceTimersByTime(500);
    });

    // Consent title should be gone (moved to notification step)
    expect(utils.queryByText('データの取り扱いについて')).toBeNull();
  });
});
