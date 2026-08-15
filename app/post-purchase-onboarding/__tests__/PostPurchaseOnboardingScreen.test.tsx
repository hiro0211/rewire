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
  const { Text, TouchableOpacity } = require('react-native');
  return {
    ThankYouStep: ({ onNext }: { onNext: () => void }) => (
      <TouchableOpacity testID="thankyou-next" onPress={onNext}>
        <Text>thankYou-step</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/postPurchaseOnboarding/ScreenTimeIntroStep', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    ScreenTimeIntroStep: ({ onNext }: { onNext: () => void }) => (
      <TouchableOpacity testID="screen-time-intro-next" onPress={onNext}>
        <Text>screenTimeIntro-step</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/postPurchaseOnboarding/DataProtectionStep', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    DataProtectionStep: ({ onNext }: { onNext: () => void }) => (
      <TouchableOpacity testID="data-protection-next" onPress={onNext}>
        <Text>dataProtection-step</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/postPurchaseOnboarding/BlockerActivationStep', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    BlockerActivationStep: ({ onComplete }: { onComplete: () => void }) => (
      <TouchableOpacity testID="blocker-activation-complete" onPress={onComplete}>
        <Text>blockerActivation-step</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/postPurchaseOnboarding/ScreenTimePermissionStep', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    ScreenTimePermissionStep: ({ onComplete }: { onComplete: () => void }) => (
      <TouchableOpacity testID="screen-time-complete" onPress={onComplete}>
        <Text>screenTime-step</Text>
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
let mockCurrentStep = 0;
jest.mock('@/hooks/postPurchaseOnboarding/usePostPurchaseFlow', () => ({
  usePostPurchaseFlow: () => ({
    step: mockCurrentStep,
    goToNext: mockGoToNext,
    goToStep: mockGoToStep,
    markCompleted: mockMarkCompleted,
    logStepViewed: mockLogStepViewed,
  }),
}));

// 画面固有のイベントはフック経由の汎用 logEvent ではなく trackEvent で送る。
// フックが汎用の抜け道を持たなくなったため、ここでモックするのは trackEvent。
const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
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

  it('step === 1 で ScreenTimeIntroStep が描画される', () => {
    mockCurrentStep = 1;
    const { getByText } = render(<PostPurchaseOnboardingScreen />);
    expect(getByText('screenTimeIntro-step')).toBeTruthy();
  });

  it('step === 2 で DataProtectionStep が描画される', () => {
    mockCurrentStep = 2;
    const { getByText } = render(<PostPurchaseOnboardingScreen />);
    expect(getByText('dataProtection-step')).toBeTruthy();
  });

  it('step === 3 で ScreenTimePermissionStep が描画される', () => {
    mockCurrentStep = 3;
    const { getByText } = render(<PostPurchaseOnboardingScreen />);
    expect(getByText('screenTime-step')).toBeTruthy();
  });

  it('step === 4 で BlockerActivationStep が描画される', () => {
    mockCurrentStep = 4;
    const { getByText } = render(<PostPurchaseOnboardingScreen />);
    expect(getByText('blockerActivation-step')).toBeTruthy();
  });

  it('step === 5 で CompleteStep が描画される', () => {
    mockCurrentStep = 5;
    const { getByText } = render(<PostPurchaseOnboardingScreen />);
    expect(getByText('complete-step')).toBeTruthy();
  });

  it.each([
    [0, 'thankYou'],
    [1, 'screenTimeIntro'],
    [2, 'dataProtection'],
    [3, 'screenTime'],
    [4, 'blockerActivation'],
    [5, 'complete'],
  ])('step === %i で logStepViewed("%s") が呼ばれる', (stepIndex, name) => {
    mockCurrentStep = stepIndex as number;
    render(<PostPurchaseOnboardingScreen />);
    expect(mockLogStepViewed).toHaveBeenCalledWith(name);
  });

  // 完了フラグ(hasCompletedPostPurchaseOnboarding)は最初の Next で立ててはいけない。
  // 立ててしまうと、権限付与やブロッカー有効化の前に中断（バックグラウンド/強制終了）
  // した課金ユーザーが二度とこのフローに戻れず、有料機能が未設定のまま放置される。
  it('最初のステップ(ThankYou)の onNext では markCompleted を呼ばない', async () => {
    mockCurrentStep = 0;
    const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
    fireEvent.press(getByTestId('thankyou-next'));
    await Promise.resolve();
    await Promise.resolve();
    expect(mockMarkCompleted).not.toHaveBeenCalled();
  });

  it('ScreenTimePermissionStep(step=3) の onComplete でも markCompleted を呼ばない', async () => {
    mockCurrentStep = 3;
    const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
    fireEvent.press(getByTestId('screen-time-complete'));
    await Promise.resolve();
    await Promise.resolve();
    expect(mockMarkCompleted).not.toHaveBeenCalled();
  });

  it('BlockerActivationStep(step=4) の onComplete でも markCompleted を呼ばない', async () => {
    mockCurrentStep = 4;
    const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
    fireEvent.press(getByTestId('blocker-activation-complete'));
    await Promise.resolve();
    await Promise.resolve();
    expect(mockMarkCompleted).not.toHaveBeenCalled();
  });

  it('CompleteStep の onFinish で初めて markCompleted し、その後 router.replace((tabs)) する', async () => {
    mockCurrentStep = 5;
    const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
    fireEvent.press(getByTestId('complete-finish'));
    await Promise.resolve();
    await Promise.resolve();
    expect(mockMarkCompleted).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  describe('右上の Skip ボタン', () => {
    it('step < 最終のときに表示される', () => {
      mockCurrentStep = 0;
      const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
      expect(getByTestId('post-purchase-skip-button')).toBeTruthy();
    });

    it('blockerActivation ステップ（step=4）でも表示される', () => {
      mockCurrentStep = 4;
      const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
      expect(getByTestId('post-purchase-skip-button')).toBeTruthy();
    });

    it('step === 最終（step=5）のときは非表示', () => {
      mockCurrentStep = 5;
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

    // パラメータ名は snake_case で固定する。BigQuery の event_params は
    // キー名の完全一致でしか引けないため、camelCase が1つ混ざるだけで
    // そのイベントだけ別の書き方を強いられ、集計時に取りこぼす。
    it('Skip タップで from_step 付きの離脱イベントを送る', () => {
      mockCurrentStep = 2;
      const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
      fireEvent.press(getByTestId('post-purchase-skip-button'));
      expect(mockTrackEvent).toHaveBeenCalledWith('post_purchase_onboarding_skipped', {
        from_step: 2,
      });
    });
  });
});
