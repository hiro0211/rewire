import { renderHook } from '@testing-library/react-native';
import { STEPS } from '@/constants/onboarding';

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

import { useOnboardingStepTracking } from '../useOnboardingStepTracking';

describe('useOnboardingStepTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初回表示で step 0 の onboarding_step_viewed を送信する', () => {
    renderHook(() => useOnboardingStepTracking(0));

    expect(mockLogEvent).toHaveBeenCalledWith('onboarding_step_viewed', {
      step_index: 0,
      step_type: 'welcome',
    });
  });

  it('ステップが進むと新しい step のイベントを送信する', () => {
    const { rerender } = renderHook(
      ({ step }) => useOnboardingStepTracking(step),
      { initialProps: { step: 0 } },
    );
    mockLogEvent.mockClear();

    rerender({ step: 1 });

    expect(mockLogEvent).toHaveBeenCalledWith('onboarding_step_viewed', {
      step_index: 1,
      step_type: STEPS[1].type,
    });
  });

  it('同じ step で再レンダーしても重複送信しない', () => {
    const { rerender } = renderHook(
      ({ step }) => useOnboardingStepTracking(step),
      { initialProps: { step: 3 } },
    );
    mockLogEvent.mockClear();

    rerender({ step: 3 });

    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it('範囲外の step ではクラッシュせず送信しない', () => {
    renderHook(() => useOnboardingStepTracking(999));

    expect(mockLogEvent).not.toHaveBeenCalled();
  });
});
