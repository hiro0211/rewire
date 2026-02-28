import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => (
      <View testID="linear-gradient" {...props}>{children}</View>
    ),
  };
});

const mockImpactAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  impactAsync: (...args: any[]) => mockImpactAsync(...args),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトルが表示される', () => {
    const { getByText } = render(<Button title="テスト" onPress={jest.fn()} />);
    expect(getByText('テスト')).toBeTruthy();
  });

  it('onPress が呼ばれる', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="テスト" onPress={onPress} />);
    fireEvent.press(getByText('テスト'));
    expect(onPress).toHaveBeenCalled();
  });

  it('タップ時にハプティクスが呼ばれる', () => {
    const { getByText } = render(<Button title="テスト" onPress={jest.fn()} />);
    fireEvent.press(getByText('テスト'));
    expect(mockImpactAsync).toHaveBeenCalledWith('Light');
  });

  it('variant="gradient" でLinearGradientが描画される', () => {
    const { getByTestId } = render(
      <Button title="テスト" onPress={jest.fn()} variant="gradient" />
    );
    expect(getByTestId('linear-gradient')).toBeTruthy();
  });

  it('variant="gradient" + disabled でLinearGradientが描画されない', () => {
    const { queryByTestId } = render(
      <Button title="テスト" onPress={jest.fn()} variant="gradient" disabled />
    );
    expect(queryByTestId('linear-gradient')).toBeNull();
  });

  it('disabled 時はタップできない', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="テスト" onPress={onPress} disabled />
    );
    fireEvent.press(getByText('テスト'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
