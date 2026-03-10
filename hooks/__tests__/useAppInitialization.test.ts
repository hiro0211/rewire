import { renderHook } from '@testing-library/react-native';

const mockLoadUser = jest.fn();
const mockLoadThemePreference = jest.fn();

jest.mock('@/stores/userStore', () => ({
  useUserStore: Object.assign(
    () => ({ loadUser: mockLoadUser, hasHydrated: false, user: null }),
    { getState: () => ({ user: null, updateUser: jest.fn() }) }
  ),
}));

jest.mock('@/stores/themeStore', () => ({
  useThemeStore: {
    getState: () => ({ loadThemePreference: mockLoadThemePreference }),
  },
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('@/lib/tracking/trackingClient', () => ({
  trackingClient: { requestPermissions: jest.fn() },
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { setUserProperty: jest.fn() },
}));

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: { initialize: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('@/lib/subscription/purchasesModule', () => ({
  Purchases: null,
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('@/lib/tracking/useScreenTracking', () => ({
  useScreenTracking: jest.fn(),
}));

import { useAppInitialization } from '../useAppInitialization';

describe('useAppInitialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期化時にloadUserが呼ばれる', () => {
    renderHook(() => useAppInitialization());
    expect(mockLoadUser).toHaveBeenCalled();
  });

  it('初期化時にloadThemePreferenceが呼ばれる', () => {
    renderHook(() => useAppInitialization());
    expect(mockLoadThemePreference).toHaveBeenCalled();
  });
});
