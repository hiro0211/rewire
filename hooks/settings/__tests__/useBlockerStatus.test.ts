import { renderHook, act } from '@testing-library/react-native';
import { AppState, Platform } from 'react-native';
import { useBlockerStatus } from '../useBlockerStatus';

jest.mock('@/lib/contentBlocker/contentBlockerBridge', () => ({
  contentBlockerBridge: {
    getBlockerStatus: jest.fn().mockResolvedValue({ isEnabled: true }),
  },
}));

describe('useBlockerStatus', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOS });
  });

  it('iOS で初期状態が checking', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    const { result } = renderHook(() => useBlockerStatus());
    expect(result.current.blockerStatus).toBe('checking');
  });

  it('iOS でマウント後に enabled になる', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    const { result } = renderHook(() => useBlockerStatus());

    await act(async () => {});

    expect(result.current.blockerStatus).toBe('enabled');
  });

  it('Android では常に checking のまま（チェックしない）', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    const { result } = renderHook(() => useBlockerStatus());

    await act(async () => {});

    expect(result.current.blockerStatus).toBe('checking');
  });
});
