import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';

const mockLock = jest.fn();
const mockUnlock = jest.fn();
const mockIsLocked = jest.fn();
jest.mock('@/lib/screenTime/appRemovalBridge', () => ({
  appRemovalBridge: {
    lock: (...a: unknown[]) => mockLock(...a),
    unlock: (...a: unknown[]) => mockUnlock(...a),
    isLocked: (...a: unknown[]) => mockIsLocked(...a),
  },
}));

const mockMarkRemovalLocked = jest.fn().mockResolvedValue(undefined);
const mockMarkRemovalUnlocked = jest.fn().mockResolvedValue(undefined);

let mockStoreState = {
  removalLocked: false as boolean,
};

jest.mock('@/stores/screenTimeStore', () => ({
  useScreenTimeStore: (selector: (s: unknown) => unknown) =>
    selector({
      ...mockStoreState,
      markRemovalLocked: mockMarkRemovalLocked,
      markRemovalUnlocked: mockMarkRemovalUnlocked,
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
    t: (k: string) => k,
    isJapanese: true,
  }),
}));

import { UninstallLockCard } from '../UninstallLockCard';

function reset(partial: Partial<typeof mockStoreState> = {}) {
  mockStoreState = { removalLocked: false, ...partial };
}

describe('UninstallLockCard (案A・信頼第一)', () => {
  let openURLSpy: jest.SpyInstance;
  let openSettingsSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLock.mockResolvedValue(true);
    mockUnlock.mockResolvedValue(true);
    mockIsLocked.mockResolvedValue(false);
    openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    openSettingsSpy = jest
      .spyOn(Linking, 'openSettings')
      .mockResolvedValue(undefined);
    reset();
  });

  afterEach(() => {
    openURLSpy.mockRestore();
    openSettingsSpy.mockRestore();
  });

  it('OFF→ONタップ: appRemovalBridge.lock+markRemovalLockedを呼ぶ', async () => {
    reset({ removalLocked: false });

    const { getByTestId } = render(<UninstallLockCard />);

    await act(async () => {
      fireEvent(getByTestId('uninstall-lock-switch'), 'valueChange', true);
    });

    expect(mockLock).toHaveBeenCalled();
    expect(mockMarkRemovalLocked).toHaveBeenCalled();
  });

  it('ON状態でOFFタップ: アプリ内では解除せず情報モーダル表示', async () => {
    reset({ removalLocked: true });

    const { getByTestId, queryByTestId } = render(<UninstallLockCard />);

    await act(async () => {
      fireEvent(getByTestId('uninstall-lock-switch'), 'valueChange', false);
    });

    expect(mockUnlock).not.toHaveBeenCalled();
    expect(queryByTestId('uninstall-lock-info-modal')).toBeTruthy();
  });

  it('モーダルの「設定を開く」: App-Prefs:SCREEN_TIME を Linking.openURLで開く', async () => {
    reset({ removalLocked: true });

    const { getByTestId } = render(<UninstallLockCard />);

    await act(async () => {
      fireEvent(getByTestId('uninstall-lock-switch'), 'valueChange', false);
    });

    await act(async () => {
      fireEvent.press(getByTestId('uninstall-lock-open-settings'));
    });

    expect(openURLSpy).toHaveBeenCalledWith('App-Prefs:SCREEN_TIME');
  });

  it('「すでに解除済み」: ネイティブ状態を再確認しfalseならstoreをunlockedに同期', async () => {
    reset({ removalLocked: true });
    mockIsLocked.mockResolvedValue(false);

    const { getByTestId } = render(<UninstallLockCard />);

    await act(async () => {
      fireEvent(getByTestId('uninstall-lock-switch'), 'valueChange', false);
    });

    await act(async () => {
      fireEvent.press(getByTestId('uninstall-lock-sync'));
    });

    expect(mockIsLocked).toHaveBeenCalled();
    expect(mockMarkRemovalUnlocked).toHaveBeenCalled();
  });

  it('「すでに解除済み」: ネイティブが trueを返すなら同期しない', async () => {
    reset({ removalLocked: true });
    mockIsLocked.mockResolvedValue(true);

    const { getByTestId } = render(<UninstallLockCard />);

    await act(async () => {
      fireEvent(getByTestId('uninstall-lock-switch'), 'valueChange', false);
    });

    await act(async () => {
      fireEvent.press(getByTestId('uninstall-lock-sync'));
    });

    expect(mockMarkRemovalUnlocked).not.toHaveBeenCalled();
  });

  it('lock失敗時はmarkRemovalLockedを呼ばない', async () => {
    mockLock.mockResolvedValue(false);
    reset({ removalLocked: false });

    const { getByTestId } = render(<UninstallLockCard />);

    await act(async () => {
      fireEvent(getByTestId('uninstall-lock-switch'), 'valueChange', true);
    });

    expect(mockMarkRemovalLocked).not.toHaveBeenCalled();
  });
});
