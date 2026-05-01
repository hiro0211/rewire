import React from 'react';
import { fireEvent, render, waitFor, act } from '@testing-library/react-native';

let focusCallback: (() => void) | null = null;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => {
    focusCallback = cb;
  },
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

let appStateChangeListener: ((state: string) => void) | null = null;
const mockAppStateRemove = jest.fn();
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.AppState = {
    addEventListener: (_event: string, cb: (state: string) => void) => {
      appStateChangeListener = cb;
      return { remove: mockAppStateRemove };
    },
  };
  return rn;
});

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

jest.mock('@/components/postPurchaseOnboarding/ThankYouStep', () => {
  const { Text } = require('react-native');
  return {
    ThankYouStep: () => <Text>thankYou-step</Text>,
  };
});

jest.mock('@/components/postPurchaseOnboarding/SafariSetupStep', () => {
  const { Text } = require('react-native');
  return {
    SafariSetupStep: () => <Text>safari-step</Text>,
  };
});

jest.mock('@/components/postPurchaseOnboarding/DemoStep', () => {
  const { Text, TouchableOpacity, View } = require('react-native');
  return {
    DemoStep: ({ onTestBlock, showRetryHint }: { onTestBlock: () => void; showRetryHint?: boolean }) => (
      <View>
        <Text>demo-step</Text>
        {showRetryHint ? <Text>demo-retry-hint</Text> : null}
        <TouchableOpacity testID="demo-test-button" onPress={onTestBlock}>
          <Text>test-button</Text>
        </TouchableOpacity>
      </View>
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

const mockGetExtensionStatus = jest.fn();
jest.mock('@/lib/safariWebExtension/safariWebExtensionBridge', () => ({
  safariWebExtensionBridge: {
    getExtensionStatus: (...args: any[]) => mockGetExtensionStatus(...args),
  },
}));

const mockMarkCompleted = jest.fn().mockResolvedValue(undefined);
const mockGoToNext = jest.fn();
const mockGoToStep = jest.fn();
const mockLogStepViewed = jest.fn();
const mockLogEvent = jest.fn();
let mockCurrentStep = 0;
jest.mock('@/hooks/postPurchaseOnboarding/usePostPurchaseFlow', () => ({
  usePostPurchaseFlow: () => ({
    step: mockCurrentStep,
    safariAlreadyEnabled: false,
    goToNext: mockGoToNext,
    goToStep: mockGoToStep,
    markCompleted: mockMarkCompleted,
    logStepViewed: mockLogStepViewed,
    logEvent: mockLogEvent,
  }),
}));

import PostPurchaseOnboardingScreen from '../index';

import { panicNotificationTracker } from '@/lib/safariWebExtension/panicNotificationTracker';

describe('PostPurchaseOnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    focusCallback = null;
    appStateChangeListener = null;
    mockCurrentStep = 0;
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: false,
      hasAllUrls: false,
      extensionBundleId: '',
      lastActiveAt: 0,
      lastBlockedAt: 0,
    });
    panicNotificationTracker.reset();
  });

  it('step === 3 で CompleteStep が描画される', () => {
    mockCurrentStep = 3;
    const { getByText } = render(<PostPurchaseOnboardingScreen />);
    expect(getByText('complete-step')).toBeTruthy();
  });

  it('step === 3 で logStepViewed("complete") が呼ばれる', () => {
    mockCurrentStep = 3;
    render(<PostPurchaseOnboardingScreen />);
    expect(mockLogStepViewed).toHaveBeenCalledWith('complete');
  });

  it('CompleteStep の onFinish で router.replace((tabs)) が呼ばれる', () => {
    mockCurrentStep = 3;
    const { getByTestId } = render(<PostPurchaseOnboardingScreen />);
    fireEvent.press(getByTestId('complete-finish'));
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('step === 0 でフォーカスコールバックが登録される（auto-advance フックの存在確認）', () => {
    mockCurrentStep = 0;
    render(<PostPurchaseOnboardingScreen />);
    expect(focusCallback).not.toBeNull();
  });

  it('step === 0 でフォーカスしても goToNext は呼ばれない', () => {
    mockCurrentStep = 0;
    render(<PostPurchaseOnboardingScreen />);
    if (focusCallback) focusCallback();
    expect(mockGoToNext).not.toHaveBeenCalled();
  });

  it('step === 2 でテストボタン後に AppState active + lastBlockedAt 更新で goToNext が呼ばれる', async () => {
    mockCurrentStep = 2;
    const { getByTestId } = render(<PostPurchaseOnboardingScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('demo-test-button'));
    });

    const startMs = Date.now();
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: true,
      hasAllUrls: true,
      extensionBundleId: '',
      lastActiveAt: startMs / 1000 + 5,
      lastBlockedAt: startMs / 1000 + 5,
    });

    await act(async () => {
      appStateChangeListener?.('active');
    });

    if (focusCallback) {
      await act(async () => {
        focusCallback?.();
      });
    }

    await waitFor(() => expect(mockGoToNext).toHaveBeenCalled());
  });

  it('step === 2 でテストボタン後、再フォーカス時に lastPanicNotifiedAt が起点より新しければ goToNext が呼ばれる', async () => {
    mockCurrentStep = 2;
    const { getByTestId } = render(<PostPurchaseOnboardingScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('demo-test-button'));
    });

    panicNotificationTracker.recordPanicNotification(Date.now() + 1000);

    if (focusCallback) {
      await act(async () => {
        focusCallback?.();
      });
    }
    await act(async () => {
      // give evaluate's microtask chain a chance to flush
      await Promise.resolve();
    });
    if (focusCallback) {
      await act(async () => {
        focusCallback?.();
      });
    }

    await waitFor(() => expect(mockGoToNext).toHaveBeenCalled());
  });

  it('step === 2 でテストボタン直後の再フォーカスでは retryHint を表示しない (grace period)', async () => {
    mockCurrentStep = 2;
    const { getByTestId, queryByText } = render(<PostPurchaseOnboardingScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('demo-test-button'));
    });

    await act(async () => {
      appStateChangeListener?.('active');
    });

    if (focusCallback) {
      await act(async () => {
        focusCallback?.();
      });
    }

    expect(queryByText('demo-retry-hint')).toBeNull();
  });
});
