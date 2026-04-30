import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useWebExtensionStatus } from '../useWebExtensionStatus';

const mockGetExtensionStatus = jest.fn();
const mockGetSetupCompletedAt = jest.fn();

jest.mock('@/lib/safariWebExtension/safariWebExtensionBridge', () => ({
  safariWebExtensionBridge: {
    getExtensionStatus: (...args: unknown[]) => mockGetExtensionStatus(...args),
  },
}));

jest.mock('@/lib/safariWebExtension/setupCompletion', () => ({
  getSetupCompletedAt: () => mockGetSetupCompletedAt(),
  setSetupCompletedAt: jest.fn(),
}));

const NOW_MS = 1_700_000_000_000;
const NOW_S = NOW_MS / 1000;

describe('useWebExtensionStatus', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    mockGetExtensionStatus.mockReset();
    mockGetSetupCompletedAt.mockReset();
    mockGetSetupCompletedAt.mockResolvedValue(0);
    jest.spyOn(Date, 'now').mockReturnValue(NOW_MS);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOS });
    jest.restoreAllMocks();
  });

  it('iOS で初期状態は checking', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: true,
      hasAllUrls: true,
      extensionBundleId: 'x',
      lastActiveAt: 0,
    });
    const { result } = renderHook(() => useWebExtensionStatus());
    expect(result.current.webExtensionStatus).toBe('checking');
  });

  it('lastActiveAt が新鮮 かつ hasAllUrls=true なら active', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: true,
      hasAllUrls: true,
      extensionBundleId: 'x',
      lastActiveAt: NOW_S - 60,
    });

    const { result } = renderHook(() => useWebExtensionStatus());
    await waitFor(() =>
      expect(result.current.webExtensionStatus).toBe('active')
    );
  });

  it('lastActiveAt が新鮮 だが hasAllUrls=false なら needsAllUrls', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: true,
      hasAllUrls: false,
      extensionBundleId: 'x',
      lastActiveAt: NOW_S - 60,
    });

    const { result } = renderHook(() => useWebExtensionStatus());
    await waitFor(() =>
      expect(result.current.webExtensionStatus).toBe('needsAllUrls')
    );
  });

  it('lastActiveAt が古い (>6h) なら stale', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: false,
      hasAllUrls: true,
      extensionBundleId: 'x',
      lastActiveAt: NOW_S - 7 * 60 * 60,
    });

    const { result } = renderHook(() => useWebExtensionStatus());
    await waitFor(() =>
      expect(result.current.webExtensionStatus).toBe('stale')
    );
  });

  it('lastActiveAt=0 なら never（grace 期間外）', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    mockGetSetupCompletedAt.mockResolvedValue(NOW_S - 1000);
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: false,
      hasAllUrls: false,
      extensionBundleId: 'x',
      lastActiveAt: 0,
    });

    const { result } = renderHook(() => useWebExtensionStatus());
    await waitFor(() =>
      expect(result.current.webExtensionStatus).toBe('never')
    );
  });

  it('grace 期間内（90秒以内）かつ lastActiveAt=0 なら active に昇格', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    mockGetSetupCompletedAt.mockResolvedValue(NOW_S - 30);
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: false,
      hasAllUrls: true,
      extensionBundleId: 'x',
      lastActiveAt: 0,
    });

    const { result } = renderHook(() => useWebExtensionStatus());
    await waitFor(() =>
      expect(result.current.webExtensionStatus).toBe('active')
    );
  });

  it('grace 期間を超過したら never に戻る', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    mockGetSetupCompletedAt.mockResolvedValue(NOW_S - 91);
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: false,
      hasAllUrls: false,
      extensionBundleId: 'x',
      lastActiveAt: 0,
    });

    const { result } = renderHook(() => useWebExtensionStatus());
    await waitFor(() =>
      expect(result.current.webExtensionStatus).toBe('never')
    );
  });

  it('recheck() を呼ぶと再ポーリングが走る', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    mockGetExtensionStatus
      .mockResolvedValueOnce({
        isEnabled: false,
        hasAllUrls: false,
        extensionBundleId: 'x',
        lastActiveAt: 0,
      })
      .mockResolvedValueOnce({
        isEnabled: true,
        hasAllUrls: true,
        extensionBundleId: 'x',
        lastActiveAt: NOW_S - 10,
      });

    const { result } = renderHook(() => useWebExtensionStatus());
    await waitFor(() =>
      expect(result.current.webExtensionStatus).toBe('never')
    );

    await act(async () => {
      await result.current.recheck();
    });

    expect(result.current.webExtensionStatus).toBe('active');
    expect(mockGetExtensionStatus).toHaveBeenCalledTimes(2);
  });

  it('Android では常に checking のまま', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    mockGetExtensionStatus.mockResolvedValue({
      isEnabled: true,
      hasAllUrls: true,
      extensionBundleId: 'x',
      lastActiveAt: NOW_S,
    });

    const { result } = renderHook(() => useWebExtensionStatus());
    await act(async () => {});

    expect(result.current.webExtensionStatus).toBe('checking');
  });
});
