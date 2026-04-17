import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { PaywallCloseButton } from '../PaywallCloseButton';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surfaceHighlight: '#1F1F2C',
      textSecondary: '#9CA0B5',
      text: '#E8E8ED',
    },
  }),
}));

describe('PaywallCloseButton', () => {
  it('close-button testID が存在する', () => {
    const { getByTestId } = render(<PaywallCloseButton onPress={jest.fn()} />);
    expect(getByTestId('close-button')).toBeTruthy();
  });

  it('タップで onPress が呼ばれる', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<PaywallCloseButton onPress={onPress} />);
    fireEvent.press(getByTestId('close-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('✕ テキストが表示される', () => {
    const { getByText } = render(<PaywallCloseButton onPress={jest.fn()} />);
    expect(getByText('✕')).toBeTruthy();
  });

  it('✕ テキストが text カラーで表示される（押せることを明示）', () => {
    const { getByText } = render(<PaywallCloseButton onPress={jest.fn()} />);
    const flatStyle = StyleSheet.flatten(getByText('✕').props.style);
    expect(flatStyle.color).toBe('#E8E8ED');
  });
});
