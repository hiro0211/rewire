import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { SetupStep } from '@/hooks/screenTime/useScreenTimeSetup';

const mockRequestPermission = jest.fn();

let mockState: { step: SetupStep; isLoading: boolean } = {
  step: 'idle',
  isLoading: false,
};

jest.mock('@/hooks/screenTime/useScreenTimeSetup', () => ({
  useScreenTimeSetup: () => ({
    step: mockState.step,
    isLoading: mockState.isLoading,
    requestPermission: mockRequestPermission,
  }),
}));

let mockAuthStatus = 'notDetermined';
jest.mock('@/lib/screenTime/screenTimeBridge', () => ({
  screenTimeBridge: {
    getAuthorizationStatus: () => mockAuthStatus,
  },
}));

jest.mock('@/components/ui/PermissionArrow', () => {
  const { View } = require('react-native');
  return { PermissionArrow: () => <View testID="permission-arrow" /> };
});

import { ScreenTimePermissionStep } from '../ScreenTimePermissionStep';

describe('ScreenTimePermissionStep（PPO・ピッカーなし）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStatus = 'notDetermined';
    mockState = { step: 'idle', isLoading: false };
  });

  it('未決定（notDetermined）ならマウント時に requestPermission を一度だけ呼ぶ', () => {
    render(<ScreenTimePermissionStep onComplete={jest.fn()} />);
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it('許可済み（approved）ならマウント時に自動起動しない', () => {
    mockAuthStatus = 'approved';
    render(<ScreenTimePermissionStep onComplete={jest.fn()} />);
    expect(mockRequestPermission).not.toHaveBeenCalled();
  });

  it('ボタンタップで requestPermission を呼ぶ', () => {
    mockAuthStatus = 'approved';
    const { getByTestId } = render(<ScreenTimePermissionStep onComplete={jest.fn()} />);
    fireEvent.press(getByTestId('screen-time-enable-button'));
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it('step が completed になったら onComplete を呼ぶ', () => {
    mockState.step = 'completed';
    const onComplete = jest.fn();
    render(<ScreenTimePermissionStep onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('step が denied になったら onComplete を呼ぶ', () => {
    mockState.step = 'denied';
    const onComplete = jest.fn();
    render(<ScreenTimePermissionStep onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('requesting 中は誘導矢印を表示する', () => {
    mockState.step = 'requesting';
    const { getByTestId } = render(<ScreenTimePermissionStep onComplete={jest.fn()} />);
    expect(getByTestId('permission-arrow')).toBeTruthy();
  });

  it('ブラウザ選択ピッカー（Choose Activities）は表示しない', () => {
    mockState.step = 'requesting';
    const { queryByTestId } = render(<ScreenTimePermissionStep onComplete={jest.fn()} />);
    expect(queryByTestId('screen-time-picker-overlay')).toBeNull();
    expect(queryByTestId('device-activity-sheet')).toBeNull();
  });
});
