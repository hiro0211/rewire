import { renderHook, act } from '@testing-library/react-native';

const mockRequestAuthorization = jest.fn();
const mockGetAuthorizationStatus = jest.fn();
const mockEnableAdultSiteBlocking = jest.fn();
const mockSetEnabled = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/screenTime/screenTimeBridge', () => ({
  screenTimeBridge: {
    requestAuthorization: (...args: any[]) => mockRequestAuthorization(...args),
    getAuthorizationStatus: (...args: any[]) => mockGetAuthorizationStatus(...args),
    enableAdultSiteBlocking: (...args: any[]) => mockEnableAdultSiteBlocking(...args),
    disableAdultSiteBlocking: jest.fn(),
  },
}));

jest.mock('@/stores/screenTimeStore', () => ({
  useScreenTimeStore: (selector: any) =>
    selector({ enabled: false, setEnabled: mockSetEnabled, loadEnabled: jest.fn() }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (k: string) => k, locale: 'ja', isJapanese: true }),
}));

import { useScreenTimeSetup } from '../useScreenTimeSetup';

describe('useScreenTimeSetup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthorizationStatus.mockReturnValue('notDetermined');
  });

  it('初期状態は idle', () => {
    const { result } = renderHook(() => useScreenTimeSetup());
    expect(result.current.step).toBe('idle');
    expect(result.current.isLoading).toBe(false);
  });

  it('startSetup を呼ぶと認可リクエストが実行される', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
    mockEnableAdultSiteBlocking.mockResolvedValue(true);

    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.startSetup();
    });

    expect(mockRequestAuthorization).toHaveBeenCalledTimes(1);
    expect(mockEnableAdultSiteBlocking).toHaveBeenCalledTimes(1);
    expect(result.current.step).toBe('completed');
  });

  it('成功時にストアのenabledをtrueに永続化する', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
    mockEnableAdultSiteBlocking.mockResolvedValue(true);

    const { result } = renderHook(() => useScreenTimeSetup());
    await act(async () => {
      await result.current.startSetup();
    });

    expect(mockSetEnabled).toHaveBeenCalledWith(true);
  });

  it('認可が拒否された場合は denied ステップになる', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.startSetup();
    });

    expect(result.current.step).toBe('denied');
    expect(mockEnableAdultSiteBlocking).not.toHaveBeenCalled();
    expect(mockSetEnabled).not.toHaveBeenCalled();
  });

  it('フィルター有効化に失敗した場合は error ステップになる', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
    mockEnableAdultSiteBlocking.mockResolvedValue(false);

    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.startSetup();
    });

    expect(result.current.step).toBe('error');
    expect(mockSetEnabled).not.toHaveBeenCalled();
  });

  it('checkStatus で既に approved+有効化済みなら completed', async () => {
    mockGetAuthorizationStatus.mockReturnValue('approved');
    mockEnableAdultSiteBlocking.mockResolvedValue(true);

    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.checkStatus();
    });

    expect(result.current.step).toBe('completed');
    expect(mockSetEnabled).toHaveBeenCalledWith(true);
  });
});
