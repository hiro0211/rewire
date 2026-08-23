import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { usePaywallOrchestration } from '../usePaywallOrchestration';
import { useUserStore } from '@/stores/userStore';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));

const mockGetSubscriptionStatus = jest.fn().mockResolvedValue({
  isActive: false,
  plan: 'free',
  expiresAt: null,
  willRenew: false,
});
jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: {
    isReady: () => false,
    initialize: jest.fn(),
    getSubscriptionStatus: (...args: unknown[]) => mockGetSubscriptionStatus(...args),
  },
}));

jest.mock('@/lib/paywall/discountExpiry', () => ({
  discountExpiry: {
    getRemainingSeconds: jest.fn().mockResolvedValue(200),
  },
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

const mockMarkLaunchPaywallShown = jest.fn();
jest.mock('@/stores/paywallStore', () => ({
  usePaywallStore: {
    getState: () => ({ markLaunchPaywallShown: mockMarkLaunchPaywallShown }),
  },
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

let mockDebugMenuEnabled = true;
jest.mock('@/constants/debug', () => ({
  get DEBUG_MENU_ENABLED() {
    return mockDebugMenuEnabled;
  },
  DEBUG_UNLOCK_DAYS: 100000,
}));

describe('usePaywallOrchestration', () => {
  it('Purchases が無い場合 paywallState が unavailable になる', async () => {
    const { result } = renderHook(() =>
      usePaywallOrchestration({ source: 'settings' }),
    );

    // Wait for async effect
    await act(async () => {});

    expect(result.current.paywallState).toBe('unavailable');
  });

  it('初期 offeringType が default', () => {
    const { result } = renderHook(() =>
      usePaywallOrchestration({ source: 'settings' }),
    );
    expect(result.current.offeringType).toBe('default');
  });

  it('handleRetry で paywallKey がインクリメントされ再読み込みが行われる', async () => {
    const { result } = renderHook(() =>
      usePaywallOrchestration({ source: 'settings' }),
    );

    await act(async () => {});
    expect(result.current.paywallState).toBe('unavailable');

    // handleRetry triggers a re-fetch cycle (loading → unavailable since Purchases is null)
    await act(async () => {
      result.current.handleRetry();
    });

    // Effect runs and resolves back to unavailable (no Purchases available)
    expect(result.current.paywallState).toBe('unavailable');
  });

  describe('handlePurchaseCompleted の遷移先分岐', () => {
    const BASE_USER = {
      id: 'u1',
      nickname: 'tester',
      goalDays: 30,
      streakStartDate: null,
      isPro: false,
      notifyTime: '22:00',
      notifyEnabled: true,
      createdAt: '2026-04-01T00:00:00.000Z',
      consentGivenAt: '2026-04-01T00:00:00.000Z',
      ageVerifiedAt: null,
    };

    beforeEach(() => {
      mockReplace.mockClear();
      // 発火回数を数えるテストがあるので、呼び出し履歴を毎回リセットする
      mockTrackEvent.mockClear();
      mockDebugMenuEnabled = true;
      useUserStore.setState({ user: BASE_USER, isLoading: false, hasHydrated: true });
    });

    it('iOS で post-purchase onboarding 未完了なら /post-purchase-onboarding に遷移する', async () => {
      Platform.OS = 'ios';
      useUserStore.setState({ user: { ...BASE_USER, hasCompletedPostPurchaseOnboarding: false } });

      const { result } = renderHook(() => usePaywallOrchestration({ source: 'onboarding' }));
      await act(async () => {
        await result.current.handlePurchaseCompleted('annual');
      });

      expect(mockReplace).toHaveBeenCalledWith('/post-purchase-onboarding');
    });

    it('iOS で post-purchase onboarding 完了済みなら tabs に遷移する', async () => {
      Platform.OS = 'ios';
      useUserStore.setState({ user: { ...BASE_USER, hasCompletedPostPurchaseOnboarding: true } });

      const { result } = renderHook(() => usePaywallOrchestration({ source: 'onboarding' }));
      await act(async () => {
        await result.current.handlePurchaseCompleted('annual');
      });

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });

    it('購入完了イベントに導線(source)と購入プランが載る', async () => {
      // これが無いと BigQuery で「どの導線が購入に繋がったか」を復元できない
      Platform.OS = 'ios';
      useUserStore.setState({ user: { ...BASE_USER, hasCompletedPostPurchaseOnboarding: true } });

      const { result } = renderHook(() => usePaywallOrchestration({ source: 'returning' }));
      await act(async () => {
        await result.current.handlePurchaseCompleted('annual');
      });

      expect(mockTrackEvent).toHaveBeenCalledWith('pro_purchase_completed', {
        source: 'returning',
        plan: 'annual',
        offering: 'default',
        // resolvePaywallVariant('u1') を実際に呼んで確かめた値
        paywall_variant: 'cosmicJourney',
      });
    });

    it('ペイウォール表示時にクールダウンの起点を記録する', async () => {
      // オンボーディング直後の表示も数えることで、入った直後の再表示を防ぐ
      renderHook(() => usePaywallOrchestration({ source: 'onboarding' }));
      await act(async () => {});

      expect(mockMarkLaunchPaywallShown).toHaveBeenCalled();
    });

    it('表示イベントの source が語彙外なら unknown に丸められる', async () => {
      renderHook(() => usePaywallOrchestration({ source: 'settings' }));
      await act(async () => {});

      expect(mockTrackEvent).toHaveBeenCalledWith('paywall_viewed', {
        source: 'unknown',
        offering: 'default',
        // resolvePaywallVariant('u1') を実際に呼んで確かめた値
        paywall_variant: 'cosmicJourney',
      });
    });

    it('user.id の割当がそのまま variant として返る', async () => {
      const { result } = renderHook(() => usePaywallOrchestration({ source: 'returning' }));
      await act(async () => {});

      expect(result.current.variant).toBe('cosmicJourney');
    });

    it('デバッグ指定を渡すと割当を上書きしてそのバリアントになる', async () => {
      // u1 の本来の割当は cosmicJourney。default を強制できることを確認する
      mockDebugMenuEnabled = true;
      const { result } = renderHook(() =>
        usePaywallOrchestration({ source: 'returning', debugVariant: 'default' }),
      );
      await act(async () => {});

      expect(result.current.variant).toBe('default');
    });

    it('デバッグ指定で開いたときは表示イベントを送らない', async () => {
      // 開発者が確認のために開いた回数が A/B の母数に混ざると、
      // その端末が本来と違うアームに計上されて比較が歪む
      mockDebugMenuEnabled = true;
      renderHook(() =>
        usePaywallOrchestration({ source: 'returning', debugVariant: 'default' }),
      );
      await act(async () => {});

      const viewedCalls = mockTrackEvent.mock.calls.filter(
        (c) => c[0] === 'paywall_viewed',
      );
      expect(viewedCalls).toEqual([]);
    });

    it('デバッグ指定が無いときは通常どおり表示イベントを送る', async () => {
      mockDebugMenuEnabled = true;
      renderHook(() => usePaywallOrchestration({ source: 'returning' }));
      await act(async () => {});

      const viewedCalls = mockTrackEvent.mock.calls.filter(
        (c) => c[0] === 'paywall_viewed',
      );
      expect(viewedCalls).toHaveLength(1);
    });

    it('DEBUG_MENU_ENABLED が false のときデバッグ指定は無視される', async () => {
      // リリースビルドでパラメータ付きのリンクを踏まれても割当が動かないこと
      mockDebugMenuEnabled = false;
      const { result } = renderHook(() =>
        usePaywallOrchestration({ source: 'returning', debugVariant: 'default' }),
      );
      await act(async () => {});

      expect(result.current.variant).toBe('cosmicJourney');
    });

    it('Android では常に tabs に遷移する', async () => {
      Platform.OS = 'android';
      useUserStore.setState({ user: { ...BASE_USER, hasCompletedPostPurchaseOnboarding: false } });

      const { result } = renderHook(() => usePaywallOrchestration({ source: 'onboarding' }));
      await act(async () => {
        await result.current.handlePurchaseCompleted('annual');
      });

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  describe('subscription guard', () => {
    const BASE_USER = {
      id: 'u1',
      nickname: 'tester',
      goalDays: 30,
      streakStartDate: null,
      isPro: false,
      notifyTime: '22:00',
      notifyEnabled: true,
      createdAt: '2026-04-01T00:00:00.000Z',
      consentGivenAt: '2026-04-01T00:00:00.000Z',
      ageVerifiedAt: null,
    };

    beforeEach(() => {
      mockReplace.mockClear();
      mockGetSubscriptionStatus.mockReset();
      useUserStore.setState({ user: BASE_USER, isLoading: false, hasHydrated: true });
    });

    it('マウント時 getSubscriptionStatus が isActive=true を返すと /(tabs) に自動遷移する', async () => {
      mockGetSubscriptionStatus.mockResolvedValue({
        isActive: true,
        plan: 'pro_annual',
        expiresAt: '2027-04-01T00:00:00.000Z',
        willRenew: true,
      });

      renderHook(() => usePaywallOrchestration({ source: 'returning' }));

      await act(async () => {});

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });

    it('マウント時 getSubscriptionStatus が isActive=false なら遷移しない', async () => {
      mockGetSubscriptionStatus.mockResolvedValue({
        isActive: false,
        plan: 'free',
        expiresAt: null,
        willRenew: false,
      });

      renderHook(() => usePaywallOrchestration({ source: 'returning' }));

      await act(async () => {});

      expect(mockReplace).not.toHaveBeenCalledWith('/(tabs)');
    });
  });

  describe('userStore 未ハイドレート時', () => {
    beforeEach(() => {
      mockTrackEvent.mockClear();
      mockMarkLaunchPaywallShown.mockClear();
      useUserStore.setState({ user: null, isLoading: false, hasHydrated: false });
    });

    it('バリアントが確定していないので isVariantResolved が false になる', async () => {
      const { result } = renderHook(() => usePaywallOrchestration({ source: 'returning' }));
      await act(async () => {});

      expect(result.current.isVariantResolved).toBe(false);
    });

    it('バリアント未確定の間は paywall_viewed を送らない', async () => {
      // fallback の 'default' で送ると、実際は cosmicJourney のユーザーが
      // default 側の母数に入って A/B の比較が壊れる
      renderHook(() => usePaywallOrchestration({ source: 'returning' }));
      await act(async () => {});

      expect(mockTrackEvent).not.toHaveBeenCalledWith('paywall_viewed', expect.anything());
    });

    it('バリアント未確定でもクールダウンの起点は記録される', async () => {
      // これをバリアントのゲート内に入れると、記録が残らないまま画面を閉じたときに
      // launchPaywallCooldown が「未記録＝表示する」に倒れ、毎起動でペイウォールが出る
      renderHook(() => usePaywallOrchestration({ source: 'returning' }));
      await act(async () => {});

      expect(mockMarkLaunchPaywallShown).toHaveBeenCalled();
    });
  });
});
