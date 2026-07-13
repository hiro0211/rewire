import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

let mockCardState = {
  visible: true,
  isRequesting: false,
  requestPermission: jest.fn(),
};
jest.mock('@/hooks/dashboard/useScreenTimePermissionCard', () => ({
  useScreenTimePermissionCard: () => mockCardState,
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
    },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (k: string) => k }),
}));

import { ScreenTimePermissionCard } from '../ScreenTimePermissionCard';

describe('ScreenTimePermissionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCardState = {
      visible: true,
      isRequesting: false,
      requestPermission: jest.fn(),
    };
  });

  it('visible=true のときタイトル・説明・ボタンを表示する', () => {
    const { getByText } = render(<ScreenTimePermissionCard />);
    expect(getByText('dashboard.screenTimePermissionCard.title')).toBeTruthy();
    expect(getByText('dashboard.screenTimePermissionCard.description')).toBeTruthy();
    expect(getByText('dashboard.screenTimePermissionCard.allow')).toBeTruthy();
  });

  it('visible=false のとき何も描画しない', () => {
    mockCardState = { ...mockCardState, visible: false };
    const { toJSON } = render(<ScreenTimePermissionCard />);
    expect(toJSON()).toBeNull();
  });

  it('「許可する」タップで requestPermission を呼ぶ', () => {
    const { getByTestId } = render(<ScreenTimePermissionCard />);
    fireEvent.press(getByTestId('screen-time-permission-allow'));
    expect(mockCardState.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('リクエスト中はボタンが無効になる', () => {
    mockCardState = { ...mockCardState, isRequesting: true };
    const { getByTestId } = render(<ScreenTimePermissionCard />);
    fireEvent.press(getByTestId('screen-time-permission-allow'));
    expect(mockCardState.requestPermission).not.toHaveBeenCalled();
  });
});
