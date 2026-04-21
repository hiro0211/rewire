import { renderHook, act } from '@testing-library/react-native';
import { useContentBlockerSetup } from '../useContentBlockerSetup';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/hooks/useContentBlockerStatus', () => ({
  useContentBlockerStatus: jest.fn(),
}));

jest.mock('@/lib/contentBlocker/contentBlockerBridge', () => ({
  contentBlockerBridge: {
    reloadBlockerRules: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('useContentBlockerSetup', () => {
  it('初期ステップは0', () => {
    const { result } = renderHook(() => useContentBlockerSetup());
    expect(result.current.step).toBe(0);
  });

  it('handleNext でステップが進む', () => {
    const { result } = renderHook(() => useContentBlockerSetup());
    act(() => { result.current.handleNext(); });
    expect(result.current.step).toBe(1);
  });

  it('handlePrev でステップが戻る', () => {
    const { result } = renderHook(() => useContentBlockerSetup());
    act(() => { result.current.handleNext(); });
    act(() => { result.current.handlePrev(); });
    expect(result.current.step).toBe(0);
  });

  it('ステップ0では handlePrev で0のまま', () => {
    const { result } = renderHook(() => useContentBlockerSetup());
    act(() => { result.current.handlePrev(); });
    expect(result.current.step).toBe(0);
  });

  it('isLoading の初期値は false', () => {
    const { result } = renderHook(() => useContentBlockerSetup());
    expect(result.current.isLoading).toBe(false);
  });
});
