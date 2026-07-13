import { renderHook, act } from '@testing-library/react-native';

let mockStatus = 'notDetermined';
const mockRefreshStatus = jest.fn();
jest.mock('@/hooks/settings/useScreenTimeStatus', () => ({
  useScreenTimeStatus: () => ({
    screenTimeStatus: mockStatus,
    refreshStatus: mockRefreshStatus,
  }),
}));

const mockRequestAuthorization = jest.fn();
jest.mock('@/lib/screenTime/screenTimeBridge', () => ({
  screenTimeBridge: {
    requestAuthorization: () => mockRequestAuthorization(),
    getAuthorizationStatus: () => mockStatus,
  },
}));

const mockAlert = jest.fn();
const mockOpenSettings = jest.fn();
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Alert: { alert: (...a: any[]) => mockAlert(...a) },
  Linking: { openSettings: () => mockOpenSettings() },
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (k: string) => k }),
}));

import { useScreenTimePermissionCard } from '../useScreenTimePermissionCard';

describe('useScreenTimePermissionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStatus = 'notDetermined';
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
  });

  it('未許可（notDetermined）のとき visible=true', () => {
    mockStatus = 'notDetermined';
    const { result } = renderHook(() => useScreenTimePermissionCard());
    expect(result.current.visible).toBe(true);
  });

  it('拒否（denied）のとき visible=true', () => {
    mockStatus = 'denied';
    const { result } = renderHook(() => useScreenTimePermissionCard());
    expect(result.current.visible).toBe(true);
  });

  it('許可済み（approved）のとき visible=false', () => {
    mockStatus = 'approved';
    const { result } = renderHook(() => useScreenTimePermissionCard());
    expect(result.current.visible).toBe(false);
  });

  it('requestPermission で許可ダイアログを出しステータスを更新する', async () => {
    const { result } = renderHook(() => useScreenTimePermissionCard());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(mockRequestAuthorization).toHaveBeenCalledTimes(1);
    expect(mockRefreshStatus).toHaveBeenCalledTimes(1);
  });

  it('リクエスト中の連打は無視する', async () => {
    let resolveAuth: (v: unknown) => void = () => {};
    mockRequestAuthorization.mockImplementation(
      () => new Promise((res) => (resolveAuth = res)),
    );

    const { result } = renderHook(() => useScreenTimePermissionCard());

    let first: Promise<void>;
    act(() => {
      first = result.current.requestPermission();
    });
    await act(async () => {
      await result.current.requestPermission();
    });
    await act(async () => {
      resolveAuth({ status: 'approved' });
      await first;
    });

    expect(mockRequestAuthorization).toHaveBeenCalledTimes(1);
  });

  it('requestAuthorization が reject しても isRequesting が戻る', async () => {
    mockRequestAuthorization.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useScreenTimePermissionCard());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.isRequesting).toBe(false);
  });

  it('拒否済み（denied）でタップ: iOSはダイアログを出さないため「設定を開く」Alert を表示', async () => {
    mockStatus = 'denied';
    mockRequestAuthorization.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useScreenTimePermissionCard());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'dashboard.screenTimePermissionCard.deniedTitle',
      'dashboard.screenTimePermissionCard.deniedMessage',
      expect.arrayContaining([
        expect.objectContaining({ text: 'dashboard.screenTimePermissionCard.openSettings' }),
      ]),
    );
  });

  it('未決定から今まさに拒否した直後は Alert を出さない', async () => {
    mockStatus = 'notDetermined';
    mockRequestAuthorization.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useScreenTimePermissionCard());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('Alert の「設定を開く」で Linking.openSettings を呼ぶ', async () => {
    mockStatus = 'denied';
    mockRequestAuthorization.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useScreenTimePermissionCard());

    await act(async () => {
      await result.current.requestPermission();
    });

    const buttons = mockAlert.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    const settingsButton = buttons.find(
      (b) => b.text === 'dashboard.screenTimePermissionCard.openSettings',
    );
    settingsButton?.onPress?.();

    expect(mockOpenSettings).toHaveBeenCalledTimes(1);
  });
});
