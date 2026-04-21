import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useWebExtensionStatus } from '../useWebExtensionStatus';

jest.mock('@/lib/safariWebExtension/safariWebExtensionBridge', () => ({
  safariWebExtensionBridge: {
    getExtensionStatus: jest.fn().mockResolvedValue({
      isEnabled: true,
      extensionBundleId: 'rewire.app.com.SafariWebExtension',
      lastActiveAt: 1700000000,
    }),
  },
}));

describe('useWebExtensionStatus', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOS });
  });

  it('iOS で初期状態は checking', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    const { result } = renderHook(() => useWebExtensionStatus());
    expect(result.current.webExtensionStatus).toBe('checking');
  });

  it('iOS でマウント後に enabled になる', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    const { result } = renderHook(() => useWebExtensionStatus());

    await act(async () => {});

    expect(result.current.webExtensionStatus).toBe('enabled');
  });

  it('Android では常に checking のまま', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    const { result } = renderHook(() => useWebExtensionStatus());

    await act(async () => {});

    expect(result.current.webExtensionStatus).toBe('checking');
  });
});
