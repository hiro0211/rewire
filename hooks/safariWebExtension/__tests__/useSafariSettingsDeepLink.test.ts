import { renderHook, act } from '@testing-library/react-native';

const mockCanOpenURL = jest.fn();
const mockOpenURL = jest.fn();
const mockOpenSettings = jest.fn();

jest.mock('react-native', () => ({
  Linking: {
    canOpenURL: (...args: unknown[]) => mockCanOpenURL(...args),
    openURL: (...args: unknown[]) => mockOpenURL(...args),
    openSettings: (...args: unknown[]) => mockOpenSettings(...args),
  },
}));

import { useSafariSettingsDeepLink } from '../useSafariSettingsDeepLink';

describe('useSafariSettingsDeepLink', () => {
  beforeEach(() => {
    mockCanOpenURL.mockReset();
    mockOpenURL.mockReset();
    mockOpenSettings.mockReset();
  });

  it('App-Prefs スキームが使える場合はそれで開く', async () => {
    mockCanOpenURL.mockResolvedValue(true);
    mockOpenURL.mockResolvedValue(true);

    const { result } = renderHook(() => useSafariSettingsDeepLink());
    await act(async () => {
      await result.current();
    });

    expect(mockCanOpenURL).toHaveBeenCalledWith('App-Prefs:com.apple.mobilesafari');
    expect(mockOpenURL).toHaveBeenCalledWith('App-Prefs:com.apple.mobilesafari');
    expect(mockOpenSettings).not.toHaveBeenCalled();
  });

  it('App-Prefs スキームが使えない場合は openSettings にフォールバックする', async () => {
    mockCanOpenURL.mockResolvedValue(false);
    mockOpenSettings.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSafariSettingsDeepLink());
    await act(async () => {
      await result.current();
    });

    expect(mockOpenURL).not.toHaveBeenCalled();
    expect(mockOpenSettings).toHaveBeenCalled();
  });

  it('openURL が失敗した場合も openSettings にフォールバックする', async () => {
    mockCanOpenURL.mockResolvedValue(true);
    mockOpenURL.mockRejectedValue(new Error('open failed'));
    mockOpenSettings.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSafariSettingsDeepLink());
    await act(async () => {
      await result.current();
    });

    expect(mockOpenSettings).toHaveBeenCalled();
  });
});
