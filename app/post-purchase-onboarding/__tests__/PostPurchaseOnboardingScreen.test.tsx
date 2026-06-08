import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const { View } = require('react-native');
  return {
    SafeAreaWrapper: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
});

jest.mock('@/components/ui/AuroraBackground', () => {
  const { View } = require('react-native');
  return { AuroraBackground: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@/components/ui/StarryOverlay', () => {
  const { View } = require('react-native');
  return { StarryOverlay: () => <View /> };
});

jest.mock('@/components/ui/ProgressBar', () => {
  const { View } = require('react-native');
  return { ProgressBar: () => <View testID="progress-bar" /> };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { textSecondary: '#aaaaaa' },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/components/postPurchaseOnboarding/ThankYouStep', () => {
  const { Text } = require('react-native');
  return {
    ThankYouStep: () => <Text>thankYou-step</Text>,
  };
});

jest.mock('@/components/postPurchaseOnboarding/ScreenTimeSetupStep', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    ScreenTimeSetupStep: ({ onComplete }: { onComplete: () => void }) => (
      <TouchableOpacity testID="screentime-complete" onPress={onComplete}>
        <Text>screentime-step</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/postPurchaseOnboarding/CompleteStep', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    CompleteStep: ({ onFinish }: { onFinish: () => void }) => (
      <TouchableOpacity onPress={onFinish} testID="complete-finish">
        <Text>complete-step</Text>
      </TouchableOpacity>
    ),
  };
});

const mockMarkCompleted = jest.fn().mockResolvedValue(undefined);
const mockGoToNext = jest.fn();
const mockGoToStep = jest.fn();
const mockLogStepViewed = jest.fn();
const mockLogEvent = jest.fn();
let mockCurrentStep = 0;
jest.mock('@/hooks/postPurchaseOnboarding/usePostPurchaseFlow', () => ({
  usePostPurchaseFlow: () => ({
    step: mockCurrentStep,
    goToNext: mockGoToNext,
    goToStep: mockGoToStep,
    markCompleted: mockMarkCompleted,
    logStepViewed: mockLogStepViewed,
    logEvent: mockLogEvent,
  }),
}));

import PostPurchaseOnboardingScreen from '../index';

describe('PostPurchaseOnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentStep = 0;
  });

  it('step === 0 で ThankYouStep が描画される', () => {
    mockCurrentStep = 0;
    const { getByText } = render(<PostPurchaseOnboardingScreen />);
    expect(getByText('thankYou-step')).toBeTruthy();
  });

  it('step === 1 で ScreenTimeSetupStep が描画される', () => {
    mockCurrentStep = 1;
    const { getByText } = render(<PostPurchaseOnboardingScreen />);
    expect(getByText('screentime-step')).toBeTruthy();
  });

  it('step === 2 で CompleteStep が描画される', () => {
    mockCurrentStep = 2;
    const { getByText } = render(<PostPurchaseOnboardingScreen />);
    expect(getByText('complete-step')).toBeTruthy();
  });

  it('step === 0 で logStepViewed("thankYou") が呼ばれる', () => {
    mockCurrentStep = 0;
    render(<PostPurchaseOnboardingScreen />);
    expect(mockLogStepViewed).toHaveBeenCalledWith('thankYou');
  });

  it('step === 1 で logStepViewed("screenTimeSetup") が呼ばれる', () => {
    mockCurrentStep = 1;
    render(<PostPurchaseOnboardingScreen />);
    expect(mockLogStepViewed).toHaveBeenCalledWith('screenTimeSetup');
  });

  it('step === 2 で logStepViewed("complete") が呼ばれる', () => {
    mockCurrentStep = 2;
    render(<PostPurchaseOnboardingScreen />);
    expect(mockLogStepViewed).toHaveBeenCalledWith('complete');
  });

  it('CompleteStep の onFinish で router.replace((tabs)) が呼ばれる', () => {
    mockCurrentStep = 2;
    const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
    fireEvent.press(getByTestId('complete-finish'));
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  describe('右上の Skip ボタン', () => {
    it('step < 最終のときに表示される', () => {
      mockCurrentStep = 0;
      const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
      expect(getByTestId('post-purchase-skip-button')).toBeTruthy();
    });

    it('step === 最終のときは非表示', () => {
      mockCurrentStep = 2;
      const { queryByTestId } = render(<PostPurchaseOnboardingScreen />);
      expect(queryByTestId('post-purchase-skip-button')).toBeNull();
    });

    it('Skip タップで markCompleted + router.replace((tabs))', async () => {
      mockCurrentStep = 0;
      const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
      fireEvent.press(getByTestId('post-purchase-skip-button'));
      // Allow async markCompleted to resolve
      await Promise.resolve();
      await Promise.resolve();
      expect(mockMarkCompleted).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });
  });
});
