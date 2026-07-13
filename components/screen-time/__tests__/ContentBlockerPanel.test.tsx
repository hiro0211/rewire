import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

jest.mock('react-native-device-activity', () => {
  const { View } = require('react-native');
  return {
    DeviceActivitySelectionSheetView: (props: any) => (
      <View testID="device-activity-sheet" {...props} />
    ),
  };
});

jest.mock('../BreathingGateModal', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    BreathingGateModal: ({ visible, onConfirm, onCancel }: any) =>
      visible ? (
        <View testID="breathing-gate-modal">
          <TouchableOpacity testID="gate-confirm" onPress={onConfirm} />
          <TouchableOpacity testID="gate-cancel" onPress={onCancel} />
        </View>
      ) : null,
  };
});

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

const mockStartSetup = jest.fn();
const mockHandlePickerChange = jest.fn();
const mockFinalizePicker = jest.fn();
const mockCancelPicker = jest.fn();
let mockSetupState: {
  step: string;
  isLoading: boolean;
  pendingSelection: unknown;
} = {
  step: 'idle',
  isLoading: false,
  pendingSelection: null,
};
jest.mock('@/hooks/screenTime/useScreenTimeSetup', () => ({
  useScreenTimeSetup: () => ({
    step: mockSetupState.step,
    isLoading: mockSetupState.isLoading,
    pendingSelection: mockSetupState.pendingSelection,
    startSetup: mockStartSetup,
    handlePickerChange: mockHandlePickerChange,
    finalizePicker: mockFinalizePicker,
    cancelPicker: mockCancelPicker,
  }),
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
    shadows: { sheet: {} },
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

describe('ContentBlockerPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApplyAppShield.mockReturnValue(true);
    mockClearAppShield.mockReturnValue(true);
    mockGetAuthorizationStatus.mockReturnValue('approved');
    mockRequestAuthorization.mockResolvedValue({ status: 'approved' });
    mockSetupState = { step: 'idle', isLoading: false, pendingSelection: null };
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

  it('ON状態でパワーボタンをタップ: 即座にはオフにせず深呼吸ゲートを開く', async () => {
    resetStore({
      enabled: true,
      selectionToken: 'tok',
      selectionApplicationCount: 2,
    });

    const { getByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });

    expect(getByTestId('breathing-gate-modal')).toBeTruthy();
    expect(mockClearAppShield).not.toHaveBeenCalled();
    expect(mockMarkCleared).not.toHaveBeenCalled();
  });

  it('深呼吸ゲートで確認後: clearAppShield+markCleared でオフになりゲートが閉じる', async () => {
    resetStore({
      enabled: true,
      selectionToken: 'tok',
      selectionApplicationCount: 2,
    });

    const { getByTestId, queryByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('gate-confirm'));
    });

    expect(mockClearAppShield).toHaveBeenCalledWith(true);
    expect(mockMarkCleared).toHaveBeenCalled();
    expect(queryByTestId('breathing-gate-modal')).toBeNull();
  });

  it('深呼吸ゲートで「保護を続ける」: オフにせずゲートを閉じる', async () => {
    resetStore({
      enabled: true,
      selectionToken: 'tok',
      selectionApplicationCount: 2,
    });

    const { getByTestId, queryByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('gate-cancel'));
    });

    expect(mockClearAppShield).not.toHaveBeenCalled();
    expect(mockMarkCleared).not.toHaveBeenCalled();
    expect(queryByTestId('breathing-gate-modal')).toBeNull();
  });

  it('未認可状態でON: requestAuthorization→denied なら Alert を表示し applyAppShield しない', async () => {
    mockGetAuthorizationStatus.mockReturnValue('notDetermined');
    mockRequestAuthorization.mockResolvedValue({ status: 'denied' });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    resetStore({ enabled: false });

    const { getByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });

    expect(mockRequestAuthorization).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      'screenTime.deniedTitle',
      'screenTime.deniedDescription',
    );
    expect(mockApplyAppShield).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('アプリをブロック行タップで startSetup を呼ぶ（ピッカー起動、画面遷移しない）', () => {
    resetStore({ selectionApplicationCount: 3 });

    const { getByTestId } = render(<ContentBlockerPanel />);
    fireEvent.press(getByTestId('content-blocker-block-apps'));

    expect(mockStartSetup).toHaveBeenCalledTimes(1);
  });

  it('step が picking のときブラウザ選択シートをインライン表示する', () => {
    mockSetupState = { step: 'picking', isLoading: false, pendingSelection: null };

    const { getByTestId } = render(<ContentBlockerPanel />);

    expect(getByTestId('device-activity-sheet')).toBeTruthy();
  });

  it('picking 以外ではブラウザ選択シートを表示しない', () => {
    mockSetupState = { step: 'idle', isLoading: false, pendingSelection: null };

    const { queryByTestId } = render(<ContentBlockerPanel />);

    expect(queryByTestId('device-activity-sheet')).toBeNull();
  });

  it('step が denied のとき Alert を表示する', () => {
    mockSetupState = { step: 'denied', isLoading: false, pendingSelection: null };
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<ContentBlockerPanel />);

    expect(alertSpy).toHaveBeenCalledWith(
      'screenTime.deniedTitle',
      'screenTime.deniedDescription',
    );
    alertSpy.mockRestore();
  });

  it('step が error のとき Alert を表示する', () => {
    mockSetupState = { step: 'error', isLoading: false, pendingSelection: null };
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<ContentBlockerPanel />);

    expect(alertSpy).toHaveBeenCalledWith(
      'screenTime.errorTitle',
      'screenTime.errorDescription',
    );
    alertSpy.mockRestore();
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

  it('ON成功時に押下(Heavy)＋完了(Success)の触覚フィードバックを発火する', async () => {
    resetStore({ enabled: false });

    const { getByTestId } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy,
    );
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });

  it('ON成功時に「ブロック完了」トーストを表示する', async () => {
    resetStore({ enabled: false });

    const { getByTestId, queryByText } = render(<ContentBlockerPanel />);
    expect(queryByText('contentBlocker.activatedToast')).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });

    expect(getByTestId('content-blocker-toast')).toBeTruthy();
    expect(queryByText('contentBlocker.activatedToast')).toBeTruthy();
  });

  it('ゲート経由でオフにするときはトーストを表示しない', async () => {
    resetStore({ enabled: true, selectionToken: 'tok' });

    const { getByTestId, queryByText } = render(<ContentBlockerPanel />);

    await act(async () => {
      fireEvent.press(getByTestId('content-blocker-power-button'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('gate-confirm'));
    });

    expect(queryByText('contentBlocker.activatedToast')).toBeNull();
  });
});
