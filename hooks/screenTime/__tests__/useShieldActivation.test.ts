import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

const mockApplyAppShield = jest.fn();
const mockGetAuthorizationStatus = jest.fn();
const mockRequestAuthorization = jest.fn();
jest.mock('@/lib/screenTime/screenTimeBridge', () => ({
  screenTimeBridge: {
    applyAppShield: (...a: unknown[]) => mockApplyAppShield(...a),
    getAuthorizationStatus: (...a: unknown[]) => mockGetAuthorizationStatus(...a),
    requestAuthorization: (...a: unknown[]) => mockRequestAuthorization(...a),
  },
}));

const mockMarkShielded = jest.fn().mockResolvedValue(undefined);
let mockStoreState = { selectionToken: null as string | null };
jest.mock('@/stores/screenTimeStore', () => ({
  useScreenTimeStore: (selector: (s: unknown) => unknown) =>
    selector({
      ...mockStoreState,
      markShielded: mockMarkShielded,
    }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (k: string) => k, isJapanese: true }),
}));

import { useShieldActivation } from '../useShieldActivation';

describe('useShieldActivation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApplyAppShield.mockReturnValue(true);
    mockGetAuthorizationStatus.mockReturnValue('approved');
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
    mockStoreState = { selectionToken: null };
  });

  it('認可済み: Heavyハプティクス→applyAppShield(t,false)→markShielded→Successハプティクス→trueを返す', async () => {
    const { result } = renderHook(() => useShieldActivation());

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current.activate();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy,
    );
    expect(mockApplyAppShield).toHaveBeenCalledWith(expect.any(Function), false);
    expect(mockMarkShielded).toHaveBeenCalled();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
    expect(returned).toBe(true);
  });

  it('選択済み: applyAppShield(t,true) が呼ばれる', async () => {
    mockStoreState = { selectionToken: 'tok' };
    const { result } = renderHook(() => useShieldActivation());

    await act(async () => {
      await result.current.activate();
    });

    expect(mockApplyAppShield).toHaveBeenCalledWith(expect.any(Function), true);
  });

  it('未認可: requestAuthorization が approved なら適用される', async () => {
    mockGetAuthorizationStatus.mockReturnValue('notDetermined');
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
    const { result } = renderHook(() => useShieldActivation());

    await act(async () => {
      await result.current.activate();
    });

    expect(mockRequestAuthorization).toHaveBeenCalled();
    expect(mockApplyAppShield).toHaveBeenCalled();
    expect(mockMarkShielded).toHaveBeenCalled();
  });

  it('未認可: requestAuthorization が denied なら Alert 表示・applyAppShield なし・false・Successハプティクスなし', async () => {
    mockGetAuthorizationStatus.mockReturnValue('notDetermined');
    mockRequestAuthorization.mockResolvedValue({ status: 'denied' });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useShieldActivation());

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current.activate();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'screenTime.deniedTitle',
      'screenTime.deniedDescription',
    );
    expect(mockApplyAppShield).not.toHaveBeenCalled();
    expect(mockMarkShielded).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(returned).toBe(false);
    alertSpy.mockRestore();
  });

  it('applyAppShield 失敗時は markShielded を呼ばず false を返す', async () => {
    mockApplyAppShield.mockReturnValue(false);
    const { result } = renderHook(() => useShieldActivation());

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current.activate();
    });

    expect(mockMarkShielded).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(returned).toBe(false);
  });

  it('isBusy 中の再呼び出しは無視される（requestAuthorization/applyAppShield は各1回）', async () => {
    mockGetAuthorizationStatus.mockReturnValue('notDetermined');
    let resolveAuth: (v: { status: string }) => void = () => {};
    mockRequestAuthorization.mockImplementation(
      () => new Promise<{ status: string }>((res) => (resolveAuth = res)),
    );

    const { result } = renderHook(() => useShieldActivation());

    let firstCall: Promise<boolean>;
    let secondResult: boolean | undefined;
    await act(async () => {
      firstCall = result.current.activate();
      secondResult = await result.current.activate();
    });

    expect(secondResult).toBe(false);

    await act(async () => {
      resolveAuth({ status: 'approved' });
      await firstCall;
    });

    expect(mockRequestAuthorization).toHaveBeenCalledTimes(1);
    expect(mockApplyAppShield).toHaveBeenCalledTimes(1);
  });
});
