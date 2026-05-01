import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      surface: '#111',
      surfaceHighlight: '#1F1F2C',
      overlay: 'rgba(0,0,0,0.6)',
      primary: '#4A90D9',
      contrastText: '#fff',
      danger: '#FF4D4D',
    },
    gradients: { button: ['#7B61FF', '#4A90D9'] },
    glow: { purple: '#7B61FF' },
    shadows: { glowCard: {}, sheet: {} },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja',
  }),
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

import { ExtensionConfirmModal } from '../ExtensionConfirmModal';

describe('ExtensionConfirmModal', () => {
  function setup(overrides: Partial<React.ComponentProps<typeof ExtensionConfirmModal>> = {}) {
    const onConfirm = jest.fn();
    const onOpenSettings = jest.fn();
    const onClose = jest.fn();
    const utils = render(
      <ExtensionConfirmModal
        visible
        onConfirm={onConfirm}
        onOpenSettings={onOpenSettings}
        onClose={onClose}
        {...overrides}
      />
    );
    return { ...utils, onConfirm, onOpenSettings, onClose };
  }

  it('visible=true でタイトルと本文を表示する', () => {
    const { getByText } = setup();

    expect(getByText('postPurchaseOnboarding.demo.confirm.title')).toBeTruthy();
    expect(getByText('postPurchaseOnboarding.demo.confirm.body')).toBeTruthy();
  });

  it('visible=false なら本体は描画されない', () => {
    const { queryByText } = setup({ visible: false });

    expect(queryByText('postPurchaseOnboarding.demo.confirm.title')).toBeNull();
  });

  it('「続ける」を押すと onConfirm が呼ばれる', () => {
    const { getByText, onConfirm } = setup();

    fireEvent.press(getByText('postPurchaseOnboarding.demo.confirm.confirmButton'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('「設定で確認」を押すと onOpenSettings が呼ばれる', () => {
    const { getByText, onOpenSettings } = setup();

    fireEvent.press(getByText('postPurchaseOnboarding.demo.confirm.openSettingsButton'));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('外側オーバーレイをタップすると onClose が呼ばれる', () => {
    const { getByTestId, onClose } = setup();

    fireEvent.press(getByTestId('extension-confirm-overlay'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
