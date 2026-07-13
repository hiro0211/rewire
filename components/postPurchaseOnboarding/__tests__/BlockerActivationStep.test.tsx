import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockHandlePress = jest.fn();
let mockHookState = {
  enabled: false,
  isBusy: false,
  toastVisible: false,
};
jest.mock('@/hooks/postPurchaseOnboarding/useBlockerActivationStep', () => ({
  useBlockerActivationStep: () => ({
    ...mockHookState,
    handlePress: mockHandlePress,
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#fff', textSecondary: '#aaa', surface: '#111' },
    shadows: { sheet: {} },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (k: string) => k }),
}));

import { BlockerActivationStep } from '../BlockerActivationStep';

describe('BlockerActivationStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHookState = { enabled: false, isBusy: false, toastVisible: false };
  });

  it('タイトルと説明を表示する', () => {
    const { getByText } = render(
      <BlockerActivationStep onComplete={jest.fn()} />,
    );
    expect(
      getByText('postPurchaseOnboarding.blockerActivation.title'),
    ).toBeTruthy();
    expect(
      getByText('postPurchaseOnboarding.blockerActivation.description'),
    ).toBeTruthy();
  });

  it('ブロックボタン（OFF・赤スタート）を表示し、押下で handlePress を呼ぶ', () => {
    const { getByTestId } = render(
      <BlockerActivationStep onComplete={jest.fn()} />,
    );
    fireEvent.press(getByTestId('blocker-activation-power-button'));
    expect(mockHandlePress).toHaveBeenCalledTimes(1);
  });

  it('toastVisible のときトーストを表示する', () => {
    mockHookState = { enabled: true, isBusy: false, toastVisible: true };
    const { getByTestId, getByText } = render(
      <BlockerActivationStep onComplete={jest.fn()} />,
    );
    expect(getByTestId('blocker-activation-toast')).toBeTruthy();
    expect(getByText('contentBlocker.activatedToast')).toBeTruthy();
  });
});
