import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

const mockApplyAppShield = jest.fn();
const mockClearAppShield = jest.fn();
const mockGetAuthorizationStatus = jest.fn();
const mockRequestAuthorization = jest.fn();
jest.mock('@/lib/screenTime/screenTimeBridge', () => ({
  screenTimeBridge: {
    applyAppShield: (...a: unknown[]) => mockApplyAppShield(...a),
    clearAppShield: (...a: unknown[]) => mockClearAppShield(...a),
    getAuthorizationStatus: (...a: unknown[]) => mockGetAuthorizationStatus(...a),
    requestAuthorization: (...a: unknown[]) => mockRequestAuthorization(...a),
  },
}));

const mockMarkShielded = jest.fn().mockResolvedValue(undefined);
const mockMarkCleared = jest.fn().mockResolvedValue(undefined);

let mockStoreState = {
  enabled: false as boolean,
  selectionToken: null as string | null,
  selectionApplicationCount: 0,
};

jest.mock('@/stores/screenTimeStore', () => ({
  useScreenTimeStore: (selector: (s: unknown) => unknown) =>
    selector({
      ...mockStoreState,
      markShielded: mockMarkShielded,
      markCleared: mockMarkCleared,
    }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#1a1a1a',
      surfaceHighlight: '#2a2a2a',
      text: '#fff',
      textSecondary: '#aaa',
    },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (k: string, args?: Record<string, unknown>) =>
      args ? `${k}:${JSON.stringify(args)}` : k,
    isJapanese: true,
  }),
}));

import { ContentBlockerPanel } from '../ContentBlockerPanel';

function resetStore(partial: Partial<typeof mockStoreState> = {}) {
  mockStoreState = {
    enabled: false,
    selectionToken: null,
    selectionApplicationCount: 0,
    ...partial,
  };
}

describe('ContentBlockerPanel (quittr-style)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApplyAppShield.mockReturnValue(true);
    mockClearAppShield.mockReturnValue(true);
    mockGetAuthorizationStatus.mockReturnValue('approved');
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
    resetStore();
  });

  it('OFF状態でパワーボタンをタップ: 認可済みなら即applyAppShield(hasSelection=false)+markShielded', async () => {
    resetStore({ enabled: false, selectionToken: null });

    const { getByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });

    expect(mockApplyAppShield).toHaveBeenCalledWith(expect.any(Function), false);
    expect(mockMarkShielded).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('OFF状態で選択済み: applyAppShield(hasSelection=true)が呼ばれる', async () => {
    resetStore({
      enabled: false,
      selectionToken: 'tok',
      selectionApplicationCount: 2,
    });

    const { getByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });

    expect(mockApplyAppShield).toHaveBeenCalledWith(expect.any(Function), true);
  });

  it('ON状態でパワーボタンをタップ: clearAppShield+markCleared', async () => {
    resetStore({
      enabled: true,
      selectionToken: 'tok',
      selectionApplicationCount: 2,
    });

    const { getByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });

    expect(mockClearAppShield).toHaveBeenCalledWith(true);
    expect(mockMarkCleared).toHaveBeenCalled();
  });

  it('未認可状態でON: requestAuthorization→denied→/screen-time-setupへ遷移', async () => {
    mockGetAuthorizationStatus.mockReturnValue('notDetermined');
    mockRequestAuthorization.mockResolvedValue({ status: 'denied' });
    resetStore({ enabled: false });

    const { getByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });

    expect(mockRequestAuthorization).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/screen-time-setup');
    expect(mockApplyAppShield).not.toHaveBeenCalled();
  });

  it('Block Apps行タップで/screen-time-setupへ遷移', () => {
    resetStore({ selectionApplicationCount: 3 });

    const { getByTestId } = render(<ContentBlockerPanel />);
    fireEvent.press(getByTestId('content-blocker-block-apps'));

    expect(mockPush).toHaveBeenCalledWith('/screen-time-setup');
  });

  it('applyAppShield失敗時はmarkShieldedを呼ばない', async () => {
    mockApplyAppShield.mockReturnValue(false);
    resetStore({ enabled: false });

    const { getByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });

    expect(mockMarkShielded).not.toHaveBeenCalled();
  });

  it('isBusy中は連打しても2度目を無視', async () => {
    resetStore({ enabled: false });
    let resolveAuth: (v: { status: string }) => void = () => {};
    mockRequestAuthorization.mockImplementation(
      () => new Promise<{ status: string }>((res) => (resolveAuth = res)),
    );
    mockGetAuthorizationStatus.mockReturnValue('notDetermined');

    const { getByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });
    await act(async () => {
      resolveAuth({ status: 'approved' });
      await waitFor(() => expect(mockApplyAppShield).toHaveBeenCalled());
    });

    expect(mockRequestAuthorization).toHaveBeenCalledTimes(1);
    expect(mockApplyAppShield).toHaveBeenCalledTimes(1);
  });
});
