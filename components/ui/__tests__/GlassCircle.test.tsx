import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GlassCircle } from '../GlassCircle';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.12)',
    },
    isDark: true,
  }),
}));

describe('GlassCircle', () => {
  const defaultProps = {
    iconName: 'leaf-outline' as const,
    label: 'テスト',
    onPress: jest.fn(),
  };

  it('レンダリングされる', () => {
    render(<GlassCircle {...defaultProps} testID="test-circle" />);
    expect(screen.getByTestId('test-circle')).toBeTruthy();
  });

  it('ラベルが表示される', () => {
    render(<GlassCircle {...defaultProps} />);
    expect(screen.getByText('テスト')).toBeTruthy();
  });

  it('タップで onPress が呼ばれる', () => {
    const onPress = jest.fn();
    render(<GlassCircle {...defaultProps} onPress={onPress} testID="tap-circle" />);
    fireEvent.press(screen.getByTestId('tap-circle'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
