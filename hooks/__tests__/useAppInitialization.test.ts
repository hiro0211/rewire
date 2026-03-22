import { renderHook, act } from '@testing-library/react-native';

const mockLoadUser = jest.fn();
const mockLoadThemePreference = jest.fn();
const mockLoadLocalePreference = jest.fn();
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
  analyticsClient: { setUserProperty: jest.fn() },
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
  Purchases: { addCustomerInfoUpdateListener: jest.fn() },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('@/lib/tracking/useScreenTracking', () => ({
  useScreenTracking: jest.fn(),
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
});
