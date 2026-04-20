import { renderHook, act } from '@testing-library/react-native';

const mockRequestAuthorization = jest.fn();
const mockGetAuthorizationStatus = jest.fn();
const mockEnableWebContentFilter = jest.fn();

jest.mock('@/lib/screenTime/screenTimeBridge', () => ({
  screenTimeBridge: {
    requestAuthorization: (...args: any[]) => mockRequestAuthorization(...args),
    getAuthorizationStatus: (...args: any[]) => mockGetAuthorizationStatus(...args),
    enableWebContentFilter: (...args: any[]) => mockEnableWebContentFilter(...args),
    disableWebContentFilter: jest.fn(),
  },
}));

import { useScreenTimeSetup } from '../useScreenTimeSetup';

describe('useScreenTimeSetup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthorizationStatus.mockResolvedValue('notDetermined');
  });

  it('初期状態は idle', () => {
    const { result } = renderHook(() => useScreenTimeSetup());
    expect(result.current.step).toBe('idle');
    expect(result.current.isLoading).toBe(false);
  });

  it('startSetup を呼ぶと認可リクエストが実行される', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
    mockEnableWebContentFilter.mockResolvedValue(true);

    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.startSetup();
    });

    expect(mockRequestAuthorization).toHaveBeenCalledTimes(1);
    expect(mockEnableWebContentFilter).toHaveBeenCalledTimes(1);
    expect(result.current.step).toBe('completed');
  });

  it('認可が拒否された場合は denied ステップになる', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.startSetup();
    });

    expect(result.current.step).toBe('denied');
    expect(mockEnableWebContentFilter).not.toHaveBeenCalled();
  });

  it('フィルター有効化に失敗した場合は error ステップになる', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
    mockEnableWebContentFilter.mockResolvedValue(false);

    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.startSetup();
    });

    expect(result.current.step).toBe('error');
  });

  it('checkStatus で既に approved+有効化済みなら completed', async () => {
    mockGetAuthorizationStatus.mockResolvedValue('approved');
    mockEnableWebContentFilter.mockResolvedValue(true);

    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.checkStatus();
    });

    expect(result.current.step).toBe('completed');
  });
});
