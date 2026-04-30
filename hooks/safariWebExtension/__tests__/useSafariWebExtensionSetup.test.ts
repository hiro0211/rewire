import { renderHook, act } from '@testing-library/react-native';
import { useSafariWebExtensionSetup } from '../useSafariWebExtensionSetup';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('@/lib/safariWebExtension/safariWebExtensionBridge', () => ({
  safariWebExtensionBridge: {
    getExtensionStatus: jest.fn().mockResolvedValue({ isEnabled: false }),
  },
}));

const mockSetSetupCompletedAt = jest.fn();
jest.mock('@/lib/safariWebExtension/setupCompletion', () => ({
  setSetupCompletedAt: (...args: unknown[]) => mockSetSetupCompletedAt(...args),
  getSetupCompletedAt: jest.fn().mockResolvedValue(0),
}));

describe('useSafariWebExtensionSetup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期ステップは 0', () => {
    const { result } = renderHook(() => useSafariWebExtensionSetup());
    expect(result.current.step).toBe(0);
  });

  it('handleNext でステップが進む', () => {
    const { result } = renderHook(() => useSafariWebExtensionSetup());
    act(() => { result.current.handleNext(); });
    expect(result.current.step).toBe(1);
    act(() => { result.current.handleNext(); });
    expect(result.current.step).toBe(2);
  });

  it('handlePrev でステップが戻る', () => {
    const { result } = renderHook(() => useSafariWebExtensionSetup());
    act(() => { result.current.handleNext(); });
    act(() => { result.current.handleNext(); });
    act(() => { result.current.handlePrev(); });
    expect(result.current.step).toBe(1);
  });

  it('ステップ0で handlePrev を呼んでも 0 のまま', () => {
    const { result } = renderHook(() => useSafariWebExtensionSetup());
    act(() => { result.current.handlePrev(); });
    expect(result.current.step).toBe(0);
  });

  it('ステップ4で handleNext を呼ぶと router.back が呼ばれる', () => {
    const { result } = renderHook(() => useSafariWebExtensionSetup());
    // 0 -> 1 -> 2 -> 3 -> 4
    act(() => { result.current.handleNext(); });
    act(() => { result.current.handleNext(); });
    act(() => { result.current.handleNext(); });
    act(() => { result.current.handleNext(); });
    expect(result.current.step).toBe(4);

    act(() => { result.current.handleNext(); });
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('handleBack で router.back が呼ばれる', () => {
    const { result } = renderHook(() => useSafariWebExtensionSetup());
    act(() => { result.current.handleBack(); });
    expect(mockBack).toHaveBeenCalled();
  });

  it('ステップ4 へ遷移したとき setSetupCompletedAt が呼ばれる（grace period 用）', () => {
    const { result } = renderHook(() => useSafariWebExtensionSetup());
    act(() => { result.current.handleNext(); });
    act(() => { result.current.handleNext(); });
    act(() => { result.current.handleNext(); });
    act(() => { result.current.handleNext(); });
    expect(result.current.step).toBe(4);
    expect(mockSetSetupCompletedAt).toHaveBeenCalledTimes(1);
    const arg = mockSetSetupCompletedAt.mock.calls[0][0];
    expect(typeof arg).toBe('number');
    expect(arg).toBeGreaterThan(0);
  });
});
