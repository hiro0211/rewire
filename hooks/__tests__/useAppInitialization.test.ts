import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';

let appStateChangeHandler: ((state: string) => void) | null = null;
jest.spyOn(AppState, 'addEventListener').mockImplementation((event, handler) => {
  if (event === 'change') {
    appStateChangeHandler = handler as (state: string) => void;
  }
  return { remove: jest.fn() } as unknown as ReturnType<typeof AppState.addEventListener>;
});

const mockLoadUser = jest.fn();
const mockLoadThemePreference = jest.fn();
const mockLoadLocalePreference = jest.fn();
const mockLoadDebugSettings = jest.fn();
const mockUpdateUser = jest.fn().mockResolvedValue(undefined);

let mockHasHydrated = false;
let mockUser: any = null;

jest.mock('@/stores/userStore', () => ({
  useUserStore: Object.assign(
    () => ({ loadUser: mockLoadUser, hasHydrated: mockHasHydrated, user: mockUser }),
    { getState: () => ({ user: mockUser, updateUser: mockUpdateUser }) },
  ),
}));

jest.mock('@/stores/themeStore', () => ({
  useThemeStore: {
    getState: () => ({ loadThemePreference: mockLoadThemePreference }),
  },
}));

jest.mock('@/stores/localeStore', () => ({
  useLocaleStore: {
    getState: () => ({ loadLocalePreference: mockLoadLocalePreference }),
  },
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  // App launch now also logs `app_open { days_since_install }`.
  analyticsClient: { setUserProperty: jest.fn(), logEvent: jest.fn() },
}));

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: {
    initialize: jest.fn().mockResolvedValue(undefined),
    getSubscriptionStatus: jest.fn().mockResolvedValue({
      isActive: false, plan: 'free', expiresAt: null, willRenew: false,
    }),
  },
}));

jest.mock('@/lib/subscription/purchasesModule', () => ({
  Purchases: {
    addCustomerInfoUpdateListener: jest.fn(),
    collectDeviceIdentifiers: jest.fn(),
  },
}));

jest.mock('@/lib/tracking/useScreenTracking', () => ({
  useScreenTracking: jest.fn(),
}));

jest.mock('@/hooks/tracking/useThemeLocaleUserProperties', () => ({
  useThemeLocaleUserProperties: jest.fn(),
}));

const mockMarkSynced = jest.fn();
const mockResetSync = jest.fn();
jest.mock('@/stores/subscriptionStore', () => ({
  useSubscriptionStore: {
    getState: () => ({
      markSynced: mockMarkSynced,
      reset: mockResetSync,
      subscriptionSynced: false,
    }),
  },
}));

jest.mock('@/stores/reflectionStore', () => ({
  useReflectionStore: {
    getState: () => ({ loadReflectionState: jest.fn() }),
  },
}));

jest.mock('@/stores/debugStore', () => ({
  useDebugStore: {
    getState: () => ({ loadDebugSettings: mockLoadDebugSettings }),
  },
}));

import { useAppInitialization } from '../useAppInitialization';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import { Purchases } from '@/lib/subscription/purchasesModule';

const mockInitialize = subscriptionClient.initialize as jest.Mock;
const mockGetSubscriptionStatus = subscriptionClient.getSubscriptionStatus as jest.Mock;
const mockAddCustomerInfoUpdateListener = (Purchases as any).addCustomerInfoUpdateListener as jest.Mock;

describe('useAppInitialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasHydrated = false;
    mockUser = null;
    mockGetSubscriptionStatus.mockResolvedValue({
      isActive: false, plan: 'free', expiresAt: null, willRenew: false,
    });
  });

  it('初期化時にloadUserが呼ばれる', () => {
    renderHook(() => useAppInitialization());
    expect(mockLoadUser).toHaveBeenCalled();
  });

  it('初期化時にloadThemePreferenceが呼ばれる', () => {
    renderHook(() => useAppInitialization());
    expect(mockLoadThemePreference).toHaveBeenCalled();
  });

  it('初期化時にloadDebugSettingsが呼ばれる', () => {
    renderHook(() => useAppInitialization());
    expect(mockLoadDebugSettings).toHaveBeenCalled();
  });

  describe('トラッキング無効化', () => {
    it('hydration後にsubscription初期化が呼ばれる', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };

      renderHook(() => useAppInitialization());
      await act(async () => {});

      expect(mockInitialize).toHaveBeenCalled();
    });

    it('collectDeviceIdentifiersは呼ばれない (IDFA非収集)', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };

      renderHook(() => useAppInitialization());
      await act(async () => {});

      expect((Purchases as any).collectDeviceIdentifiers).not.toHaveBeenCalled();
    });
  });

  describe('サブスクリプション初期同期', () => {
    it('hasHydrated後にgetSubscriptionStatusが呼ばれる', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      renderHook(() => useAppInitialization());
      await act(async () => {});
      expect(mockGetSubscriptionStatus).toHaveBeenCalled();
    });

    it('サブスクリプションがアクティブならisPro=trueでupdateUserが呼ばれる', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      mockGetSubscriptionStatus.mockResolvedValue({
        isActive: true, plan: 'pro_annual', expiresAt: null, willRenew: false,
      });
      renderHook(() => useAppInitialization());
      await act(async () => {});
      expect(mockUpdateUser).toHaveBeenCalledWith({ isPro: true });
    });

    it('サブスクリプションが非アクティブでisPro=trueの場合falseに更新する', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: true };
      mockGetSubscriptionStatus.mockResolvedValue({
        isActive: false, plan: 'free', expiresAt: null, willRenew: false,
      });
      renderHook(() => useAppInitialization());
      await act(async () => {});
      expect(mockUpdateUser).toHaveBeenCalledWith({ isPro: false });
    });

    it('isPro値が一致している場合はupdateUserを呼ばない', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: true };
      mockGetSubscriptionStatus.mockResolvedValue({
        isActive: true, plan: 'pro_annual', expiresAt: null, willRenew: false,
      });
      renderHook(() => useAppInitialization());
      await act(async () => {});
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('getSubscriptionStatusが失敗してもクラッシュしない', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      mockGetSubscriptionStatus.mockRejectedValue(new Error('Network error'));
      renderHook(() => useAppInitialization());
      await act(async () => {});
      expect(mockAddCustomerInfoUpdateListener).toHaveBeenCalled();
    });
  });

  describe('subscriptionSynced フラグ発火', () => {
    it('getSubscriptionStatus 完了後に markSynced が呼ばれる', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      renderHook(() => useAppInitialization());
      await act(async () => {});
      expect(mockMarkSynced).toHaveBeenCalled();
    });

    it('getSubscriptionStatus が失敗しても markSynced は呼ばれる', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      mockGetSubscriptionStatus.mockRejectedValue(new Error('Network error'));
      renderHook(() => useAppInitialization());
      await act(async () => {});
      expect(mockMarkSynced).toHaveBeenCalled();
    });

    it('initialize が失敗しても markSynced は呼ばれる', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      mockInitialize.mockRejectedValueOnce(new Error('init failed'));
      renderHook(() => useAppInitialization());
      await act(async () => {});
      expect(mockMarkSynced).toHaveBeenCalled();
    });
  });

  describe('listener による isPro=false 上書き抑止', () => {
    it('listener が空 active を通知しても updateUser は呼ばれない', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: true };
      mockGetSubscriptionStatus.mockResolvedValue({
        isActive: true, plan: 'pro_annual', expiresAt: null, willRenew: true,
      });
      renderHook(() => useAppInitialization());
      await act(async () => {});

      const listenerFn = mockAddCustomerInfoUpdateListener.mock.calls[0][0];
      mockUpdateUser.mockClear();
      await act(async () => {
        listenerFn({ entitlements: { active: {} } });
      });

      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('listener が active を通知したら updateUser({isPro: true}) が呼ばれる', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      renderHook(() => useAppInitialization());
      await act(async () => {});

      const listenerFn = mockAddCustomerInfoUpdateListener.mock.calls[0][0];
      mockUpdateUser.mockClear();
      await act(async () => {
        listenerFn({ entitlements: { active: { 'Rewire Pro': {} } } });
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({ isPro: true });
    });

    it('既に isPro=true のユーザーに対し listener が active を通知しても updateUser は呼ばれない', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: true };
      mockGetSubscriptionStatus.mockResolvedValue({
        isActive: true, plan: 'pro_annual', expiresAt: null, willRenew: true,
      });
      renderHook(() => useAppInitialization());
      await act(async () => {});

      const listenerFn = mockAddCustomerInfoUpdateListener.mock.calls[0][0];
      mockUpdateUser.mockClear();
      await act(async () => {
        listenerFn({ entitlements: { active: { 'Rewire Pro': {} } } });
      });

      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  describe('configure 先行起動', () => {
    it('hasHydrated=false でも初期化時に subscriptionClient.initialize が呼ばれる', async () => {
      mockHasHydrated = false;
      mockUser = null;
      renderHook(() => useAppInitialization());
      await act(async () => {});
      expect(mockInitialize).toHaveBeenCalled();
    });
  });

  describe('AppState active 再取得', () => {
    beforeEach(() => {
      appStateChangeHandler = null;
    });

    it('AppState が active に遷移すると getSubscriptionStatus が再呼び出しされる', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      renderHook(() => useAppInitialization());
      await act(async () => {});

      mockGetSubscriptionStatus.mockClear();
      expect(appStateChangeHandler).not.toBeNull();
      await act(async () => {
        appStateChangeHandler!('active');
      });

      expect(mockGetSubscriptionStatus).toHaveBeenCalled();
    });

    it('AppState が background に遷移しても getSubscriptionStatus は呼ばれない', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      renderHook(() => useAppInitialization());
      await act(async () => {});

      mockGetSubscriptionStatus.mockClear();
      await act(async () => {
        appStateChangeHandler!('background');
      });

      expect(mockGetSubscriptionStatus).not.toHaveBeenCalled();
    });

    it('active 遷移時に isActive=true が返れば isPro=true に更新される', async () => {
      mockHasHydrated = true;
      mockUser = { nickname: 'Test', isPro: false };
      renderHook(() => useAppInitialization());
      await act(async () => {});

      mockGetSubscriptionStatus.mockResolvedValue({
        isActive: true, plan: 'pro_annual', expiresAt: null, willRenew: true,
      });
      mockUpdateUser.mockClear();
      await act(async () => {
        appStateChangeHandler!('active');
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({ isPro: true });
    });
  });
});
