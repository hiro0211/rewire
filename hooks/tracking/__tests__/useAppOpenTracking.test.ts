import { renderHook, waitFor } from '@testing-library/react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { useAppOpenTracking } from '../useAppOpenTracking';

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: jest.fn(),
    setUserProperty: jest.fn(),
  },
}));

describe('useAppOpenTracking', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('起動時に app_open を発火する', async () => {
    renderHook(() => useAppOpenTracking(null));

    await waitFor(() => {
      expect(analyticsClient.logEvent).toHaveBeenCalledWith(
        'app_open',
        expect.objectContaining({ days_since_install: 0 }),
      );
    });
  });

  // Without this, GA4 can say a user was active on a date but not how far into
  // their lifecycle that was — which is exactly the churn-day question.
  it('インストールからの経過日数を含める', async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    renderHook(() => useAppOpenTracking(threeDaysAgo.toISOString()));

    await waitFor(() => {
      expect(analyticsClient.logEvent).toHaveBeenCalledWith(
        'app_open',
        expect.objectContaining({ days_since_install: 3 }),
      );
    });
  });

  it('経過日数をユーザープロパティにも設定する', async () => {
    renderHook(() => useAppOpenTracking(null));

    await waitFor(() => {
      expect(analyticsClient.setUserProperty).toHaveBeenCalledWith(
        'days_since_install',
        '0',
      );
    });
  });

  it('同一起動で二重に発火しない', async () => {
    const { rerender } = renderHook(() => useAppOpenTracking(null));

    await waitFor(() => {
      expect(analyticsClient.logEvent).toHaveBeenCalledTimes(1);
    });

    rerender(undefined);
    rerender(undefined);

    expect(analyticsClient.logEvent).toHaveBeenCalledTimes(1);
  });
});
