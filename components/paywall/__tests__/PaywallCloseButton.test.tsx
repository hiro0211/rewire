import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaywallCloseButton } from '../PaywallCloseButton';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surfaceHighlight: '#1F1F2C',
      textSecondary: '#6B6B7B',
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
});
