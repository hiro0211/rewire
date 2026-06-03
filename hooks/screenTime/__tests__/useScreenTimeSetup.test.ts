import { renderHook, act } from '@testing-library/react-native';

const mockRequestAuthorization = jest.fn();
const mockPersistSelection = jest.fn();
const mockApplyAppShield = jest.fn();
const mockSetSelection = jest.fn().mockResolvedValue(undefined);
const mockMarkShielded = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/screenTime/screenTimeBridge', () => ({
  screenTimeBridge: {
    requestAuthorization: (...args: unknown[]) => mockRequestAuthorization(...args),
    persistSelection: (...args: unknown[]) => mockPersistSelection(...args),
    applyAppShield: (...args: unknown[]) => mockApplyAppShield(...args),
  },
}));

jest.mock('@/stores/screenTimeStore', () => ({
  useScreenTimeStore: (selector: (s: unknown) => unknown) =>
    selector({
      setSelection: mockSetSelection,
      markShielded: mockMarkShielded,
    }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (k: string) => k, locale: 'ja', isJapanese: true }),
}));

import { useScreenTimeSetup } from '../useScreenTimeSetup';

describe('useScreenTimeSetup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPersistSelection.mockReturnValue(true);
    mockApplyAppShield.mockReturnValue(true);
  });

  it('初期状態は idle', () => {
    const { result } = renderHook(() => useScreenTimeSetup());
    expect(result.current.step).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.pendingSelection).toBeNull();
  });

  it('startSetup成功後はpickingに遷移する', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });

    const { result } = renderHook(() => useScreenTimeSetup());
    await act(async () => {
      await result.current.startSetup();
    });

    expect(result.current.step).toBe('picking');
    expect(mockRequestAuthorization).toHaveBeenCalledTimes(1);
  });

  it('認可拒否時はdeniedに遷移し、shield関数を呼ばない', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useScreenTimeSetup());
    await act(async () => {
      await result.current.startSetup();
    });

    expect(result.current.step).toBe('denied');
    expect(mockApplyAppShield).not.toHaveBeenCalled();
  });

  it('handlePickerChange: 空でない選択を保持する', () => {
    const { result } = renderHook(() => useScreenTimeSetup());

    act(() => {
      result.current.handlePickerChange('tok-abc', 3);
    });

    expect(result.current.pendingSelection).toEqual({
      familyActivitySelection: 'tok-abc',
      applicationCount: 3,
    });
  });

  it('handlePickerChange: 空選択はnullリセット', () => {
    const { result } = renderHook(() => useScreenTimeSetup());

    act(() => {
      result.current.handlePickerChange('tok-abc', 3);
    });
    expect(result.current.pendingSelection).not.toBeNull();

    act(() => {
      result.current.handlePickerChange('', 0);
    });
    expect(result.current.pendingSelection).toBeNull();
  });

  it('finalizePicker成功: persist+shield+ストア更新+completedに遷移', async () => {
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });

    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.startSetup();
    });

    act(() => {
      result.current.handlePickerChange('tok-final', 4);
    });

    await act(async () => {
      await result.current.finalizePicker();
    });

    expect(mockPersistSelection).toHaveBeenCalledWith('tok-final');
    expect(mockApplyAppShield).toHaveBeenCalled();
    expect(mockSetSelection).toHaveBeenCalledWith('tok-final', 4);
    expect(mockMarkShielded).toHaveBeenCalled();
    expect(result.current.step).toBe('completed');
  });

  it('finalizePicker: pendingSelectionが無い場合はidleに戻る', async () => {
    const { result } = renderHook(() => useScreenTimeSetup());

    await act(async () => {
      await result.current.finalizePicker();
    });

    expect(result.current.step).toBe('idle');
    expect(mockPersistSelection).not.toHaveBeenCalled();
  });

  it('persistSelection失敗時はerrorに遷移', async () => {
    mockPersistSelection.mockReturnValue(false);

    const { result } = renderHook(() => useScreenTimeSetup());

    act(() => {
      result.current.handlePickerChange('tok', 1);
    });

    await act(async () => {
      await result.current.finalizePicker();
    });

    expect(result.current.step).toBe('error');
    expect(mockApplyAppShield).not.toHaveBeenCalled();
  });

  it('applyAppShield失敗時はerrorに遷移', async () => {
    mockApplyAppShield.mockReturnValue(false);

    const { result } = renderHook(() => useScreenTimeSetup());

    act(() => {
      result.current.handlePickerChange('tok', 1);
    });

    await act(async () => {
      await result.current.finalizePicker();
    });

    expect(result.current.step).toBe('error');
    expect(mockSetSelection).not.toHaveBeenCalled();
  });

  it('cancelPickerでidleに戻りpendingがクリアされる', () => {
    const { result } = renderHook(() => useScreenTimeSetup());

    act(() => {
      result.current.handlePickerChange('tok', 2);
    });

    act(() => {
      result.current.cancelPicker();
    });

    expect(result.current.step).toBe('idle');
    expect(result.current.pendingSelection).toBeNull();
  });
});
