import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    dismiss: jest.fn(),
    back: jest.fn(),
    push: jest.fn(),
  }),
  useLocalSearchParams: () => mockSearchParams,
}));

// 設定画面のデバッグメニューは debugVariant を付けて遷移するので、
// ルートパラメータを差し替えられる形にしておく
let mockSearchParams: Record<string, string> = { source: 'onboarding' };

let mockDebugMenuEnabled = true;
jest.mock('@/constants/debug', () => ({
  get DEBUG_MENU_ENABLED() {
    return mockDebugMenuEnabled;
  },
  DEBUG_UNLOCK_DAYS: 100000,
}));

// resolvePaywallVariant を実際に呼んで確かめた割当。
// 'u1' → cosmicJourney / 'user-1' → default
const COSMIC_USER_ID = 'u1';
const DEFAULT_USER_ID = 'user-1';

let mockUserId: string | null = COSMIC_USER_ID;
let mockHasHydrated = true;
const mockUpdateUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => {
  const buildState = () => ({
    user: mockUserId ? { id: mockUserId, isPro: false } : null,
    hasHydrated: mockHasHydrated,
    updateUser: mockUpdateUser,
  });
  const useUserStore = (selector?: (s: any) => any) =>
    selector ? selector(buildState()) : buildState();
  useUserStore.getState = buildState;
  return { useUserStore };
});

const mockGetOfferings = jest.fn();
jest.mock('@/lib/subscription/purchasesModule', () => ({
  Purchases: { getOfferings: (...args: any[]) => mockGetOfferings(...args) },
}));

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: {
    isReady: () => true,
    initialize: jest.fn().mockResolvedValue(undefined),
    getSubscriptionStatus: jest.fn().mockResolvedValue({
      isActive: false,
      plan: 'free',
      expiresAt: null,
      willRenew: false,
    }),
  },
}));

import PaywallScreen from '../paywall';

const OFFERING = {
  annual: { product: { price: 5400, priceString: '¥5,400', currencyCode: 'JPY' } },
  monthly: { product: { price: 680, priceString: '¥680', currencyCode: 'JPY' } },
};

/** PaywallDefault だけが出す文言。A案には無いので判別に使える */
const DEFAULT_TAGLINE = '自分を、取り戻そう。';

describe('PaywallScreen のA/B分岐', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserId = COSMIC_USER_ID;
    mockHasHydrated = true;
    mockDebugMenuEnabled = true;
    mockSearchParams = { source: 'onboarding' };
    mockGetOfferings.mockResolvedValue({ current: OFFERING });
  });

  describe('設定画面のデバッグメニューから開いたとき', () => {
    it('cosmicJourney 指定なら割当が default でも星の旅ペイウォールが出る', async () => {
      // これが動かないと、default に割り当てられた開発者は新ペイウォールを
      // 一生目視確認できない
      mockUserId = DEFAULT_USER_ID;
      mockSearchParams = { debugVariant: 'cosmicJourney' };

      const { findByTestId } = render(<PaywallScreen />);

      expect(await findByTestId('cosmic-hero-orb')).toBeTruthy();
    });

    it('default 指定なら割当が cosmicJourney でも既存ペイウォールが出る', async () => {
      mockUserId = COSMIC_USER_ID;
      mockSearchParams = { debugVariant: 'default' };

      const { findByText } = render(<PaywallScreen />);

      expect(await findByText(DEFAULT_TAGLINE)).toBeTruthy();
    });

    it('デバッグ指定で開いたときは表示イベントを送らない', async () => {
      mockUserId = DEFAULT_USER_ID;
      mockSearchParams = { debugVariant: 'cosmicJourney' };

      const { findByTestId } = render(<PaywallScreen />);
      await findByTestId('cosmic-hero-orb');

      const viewed = mockTrackEvent.mock.calls.filter((c) => c[0] === 'paywall_viewed');
      expect(viewed).toEqual([]);
    });

    it('DEBUG_MENU_ENABLED が false なら指定は無視され本来の割当が出る', async () => {
      mockDebugMenuEnabled = false;
      mockUserId = DEFAULT_USER_ID;
      mockSearchParams = { debugVariant: 'cosmicJourney' };

      const { findByText } = render(<PaywallScreen />);

      expect(await findByText(DEFAULT_TAGLINE)).toBeTruthy();
    });
  });

  it('cosmicJourney に割り当てられたとき星の旅ペイウォールが描画される', async () => {
    const { findByTestId } = render(<PaywallScreen />);

    expect(await findByTestId('cosmic-hero-orb')).toBeTruthy();
  });

  it('default に割り当てられたとき既存ペイウォールが描画される', async () => {
    mockUserId = DEFAULT_USER_ID;

    const { findByText } = render(<PaywallScreen />);

    expect(await findByText(DEFAULT_TAGLINE)).toBeTruthy();
  });

  it('default に割り当てられたとき星の旅ペイウォールは描画されない', async () => {
    mockUserId = DEFAULT_USER_ID;

    const { findByText, queryByTestId } = render(<PaywallScreen />);
    await findByText(DEFAULT_TAGLINE);

    expect(queryByTestId('cosmic-hero-orb')).toBeNull();
  });

  it('userStore が未ハイドレートの間はどちらのペイウォールも描画されない', async () => {
    // 先に default を見せてから A案に差し替えると、実験群のユーザーが
    // 一瞬だけ対照群の画面を見ることになり、体験も計測も濁る
    mockHasHydrated = true;
    mockUserId = COSMIC_USER_ID;
    const { findByTestId } = render(<PaywallScreen />);
    await findByTestId('cosmic-hero-orb');

    mockHasHydrated = false;
    const { queryByTestId, queryByText } = render(<PaywallScreen />);

    expect(queryByTestId('cosmic-hero-orb') ?? queryByText(DEFAULT_TAGLINE)).toBeNull();
  });

  it('offerings が取れないときはバリアントに関わらずフォールバックUIが出る', async () => {
    // offerings の失敗は A/B と無関係。バリアント判定より先に倒さないと、
    // 未ハイドレートのユーザーに永久スピナーを見せることになる
    mockHasHydrated = false;
    mockGetOfferings.mockResolvedValue(null);

    const { findByText } = render(<PaywallScreen />);

    expect(await findByText('いま、つながりません')).toBeTruthy();
  });

  it('表示イベントに割り当てられたバリアントが載る', async () => {
    render(<PaywallScreen />);

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('paywall_viewed', {
        source: 'onboarding',
        offering: 'default',
        paywall_variant: 'cosmicJourney',
      });
    });
  });
});
