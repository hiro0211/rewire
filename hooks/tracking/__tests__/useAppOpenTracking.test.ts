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
    renderHook(() => useAppOpenTracking(null, true));

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
    renderHook(() => useAppOpenTracking(threeDaysAgo.toISOString(), true));

    await waitFor(() => {
      expect(analyticsClient.logEvent).toHaveBeenCalledWith(
        'app_open',
        expect.objectContaining({ days_since_install: 3 }),
      );
    });
  });

  it('経過日数をユーザープロパティにも設定する', async () => {
    renderHook(() => useAppOpenTracking(null, true));

    await waitFor(() => {
      expect(analyticsClient.setUserProperty).toHaveBeenCalledWith(
        'days_since_install',
        '0',
      );
    });
  });

  it('同一起動で二重に発火しない', async () => {
    const { rerender } = renderHook(() => useAppOpenTracking(null, true));

    await waitFor(() => {
      expect(analyticsClient.logEvent).toHaveBeenCalledTimes(1);
    });

    rerender(undefined);
    rerender(undefined);

    expect(analyticsClient.logEvent).toHaveBeenCalledTimes(1);
  });

  // 既存ユーザーがアップデートした際、ストア hydration 前は createdAt が null。
  // その null で先に発火して install date を「今日」で固定してしまうと、
  // 全既存ユーザーが「アップデート日=インストール日」扱いになりリテンションが壊れる。
  it('hydration 前(ready=false)は発火せず、ready=true になってから実際の createdAt でシードする', async () => {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const createdAt = fiveDaysAgo.toISOString();

    const { rerender } = renderHook(
      ({ c, r }: { c: string | null; r: boolean }) => useAppOpenTracking(c, r),
      { initialProps: { c: null as string | null, r: false } },
    );

    // hydration 前は何も発火しない
    await Promise.resolve();
    expect(analyticsClient.logEvent).not.toHaveBeenCalled();

    // hydration 完了をシミュレート（実際の createdAt が入り ready=true になる）
    rerender({ c: createdAt, r: true });

    await waitFor(() => {
      expect(analyticsClient.logEvent).toHaveBeenCalledWith(
        'app_open',
        expect.objectContaining({ days_since_install: 5 }),
      );
    });
    // 「今日=day 0」で誤ってシードされていないこと
    expect(analyticsClient.logEvent).not.toHaveBeenCalledWith(
      'app_open',
      expect.objectContaining({ days_since_install: 0 }),
    );
  });
});
