import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

const mockApplyAppShield = jest.fn();
const mockClearAppShield = jest.fn();
jest.mock('@/lib/screenTime/screenTimeBridge', () => ({
  screenTimeBridge: {
    applyAppShield: (...a: unknown[]) => mockApplyAppShield(...a),
    clearAppShield: (...a: unknown[]) => mockClearAppShield(...a),
  },
}));

const mockMarkShielded = jest.fn().mockResolvedValue(undefined);
const mockMarkCleared = jest.fn().mockResolvedValue(undefined);

let mockStoreState = {
  enabled: false as boolean,
  selectionToken: null as string | null,
  selectionApplicationCount: 0,
  lastShieldedAt: null as number | null,
  lastClearedAt: null as number | null,
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
      primary: '#8B5CF6',
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

import { BrowserShieldToggleCard } from '../BrowserShieldToggleCard';

function resetStore(partial: Partial<typeof mockStoreState> = {}) {
  mockStoreState = {
    enabled: false,
    selectionToken: null,
    selectionApplicationCount: 0,
    lastShieldedAt: null,
    lastClearedAt: null,
    ...partial,
  };
}

describe('BrowserShieldToggleCard (案A)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApplyAppShield.mockReturnValue(true);
    mockClearAppShield.mockReturnValue(true);
    resetStore();
  });

  it('未選択かつOFF状態でトグルONタップ→/screen-time-setupへ遷移', () => {
    resetStore({ enabled: false, selectionToken: null });

    const { getByTestId } = render(<BrowserShieldToggleCard />);
    const sw = getByTestId('browser-shield-toggle-switch');

    fireEvent(sw, 'valueChange', true);

    expect(mockPush).toHaveBeenCalledWith('/screen-time-setup');
    expect(mockApplyAppShield).not.toHaveBeenCalled();
  });

  it('選択済み(OFF)→トグルON: applyAppShield+markShielded', async () => {
    resetStore({ enabled: false, selectionToken: 'tok-abc', selectionApplicationCount: 3 });

    const { getByTestId } = render(<BrowserShieldToggleCard />);

    await act(async () => {
      fireEvent(getByTestId('browser-shield-toggle-switch'), 'valueChange', true);
    });

    expect(mockApplyAppShield).toHaveBeenCalledTimes(1);
    expect(mockMarkShielded).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('ON→OFFタップ: 確認なしで即clearAppShield+markCleared (案Aの哲学)', async () => {
    resetStore({ enabled: true, selectionToken: 'tok', selectionApplicationCount: 3 });

    const { getByTestId } = render(<BrowserShieldToggleCard />);

    await act(async () => {
      fireEvent(getByTestId('browser-shield-toggle-switch'), 'valueChange', false);
    });

    expect(mockClearAppShield).toHaveBeenCalledTimes(1);
    expect(mockMarkCleared).toHaveBeenCalledTimes(1);
  });

  it('「対象ブラウザを変更」タップで/screen-time-setupへ遷移', () => {
    resetStore({ selectionToken: 'tok', selectionApplicationCount: 3 });

    const { getByTestId } = render(<BrowserShieldToggleCard />);
    fireEvent.press(getByTestId('browser-shield-change-targets'));

    expect(mockPush).toHaveBeenCalledWith('/screen-time-setup');
  });

  it('selectionApplicationCount=0なら未選択ラベルを表示', () => {
    resetStore({ selectionApplicationCount: 0 });

    const { queryByText } = render(<BrowserShieldToggleCard />);

    expect(queryByText('screenTime.targetNone')).toBeTruthy();
  });

  it('applyAppShield失敗時はmarkShieldedを呼ばない', async () => {
    mockApplyAppShield.mockReturnValue(false);
    resetStore({ selectionToken: 'tok', selectionApplicationCount: 2 });

    const { getByTestId } = render(<BrowserShieldToggleCard />);

    await act(async () => {
      fireEvent(getByTestId('browser-shield-toggle-switch'), 'valueChange', true);
    });

    expect(mockApplyAppShield).toHaveBeenCalled();
    expect(mockMarkShielded).not.toHaveBeenCalled();
  });
});
