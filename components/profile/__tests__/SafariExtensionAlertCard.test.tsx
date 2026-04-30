import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#999',
      danger: '#E74C3C',
      primary: '#4DB8FF',
      surface: '#1a1a3e',
    },
    shadows: {
      glowCard: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
    },
  }),
}));

import { SafariExtensionAlertCard } from '../SafariExtensionAlertCard';

describe('SafariExtensionAlertCard', () => {
  const defaultProps = {
    title: 'Safari 拡張が有効になっていません',
    description: 'iOS の設定から有効にしてください',
    actionLabel: '設定を開く',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onPress = jest.fn();
  });

  it('title を表示する', () => {
    const { getByText } = render(<SafariExtensionAlertCard {...defaultProps} />);
    expect(getByText('Safari 拡張が有効になっていません')).toBeTruthy();
  });

  it('description を表示する', () => {
    const { getByText } = render(<SafariExtensionAlertCard {...defaultProps} />);
    expect(getByText('iOS の設定から有効にしてください')).toBeTruthy();
  });

  it('actionLabel を表示する', () => {
    const { getByText } = render(<SafariExtensionAlertCard {...defaultProps} />);
    expect(getByText('設定を開く')).toBeTruthy();
  });

  it('shield-outline アイコンを描画する', () => {
    const { getByTestId } = render(<SafariExtensionAlertCard {...defaultProps} />);
    expect(getByTestId('safari-extension-alert-icon')).toBeTruthy();
  });

  it('アクションボタンをタップすると onPress が呼ばれる', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SafariExtensionAlertCard {...defaultProps} onPress={onPress} />
    );
    fireEvent.press(getByTestId('safari-extension-alert-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('カードに danger 色の border が適用される（既定 variant=warning）', () => {
    const { getByTestId } = render(<SafariExtensionAlertCard {...defaultProps} />);
    const card = getByTestId('safari-extension-alert-card');
    const flat = require('react-native').StyleSheet.flatten(card.props.style);
    expect(flat.borderColor).toBe('#E74C3C');
    expect(flat.borderWidth).toBeGreaterThan(0);
  });

  it('variant="info" のとき border は primary 色になる', () => {
    const { getByTestId } = render(
      <SafariExtensionAlertCard {...defaultProps} variant="info" />
    );
    const card = getByTestId('safari-extension-alert-card');
    const flat = require('react-native').StyleSheet.flatten(card.props.style);
    expect(flat.borderColor).toBe('#4DB8FF');
  });

  it('variant="info" のときアクションボタン背景も primary 色になる', () => {
    const { getByTestId } = render(
      <SafariExtensionAlertCard {...defaultProps} variant="info" />
    );
    const button = getByTestId('safari-extension-alert-button');
    const flat = require('react-native').StyleSheet.flatten(button.props.style);
    expect(flat.backgroundColor).toBe('#4DB8FF');
  });
});
