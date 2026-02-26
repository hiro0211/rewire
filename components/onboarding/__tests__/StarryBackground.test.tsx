import React from 'react';
import { render } from '@testing-library/react-native';
import { StarryBackground } from '../StarryBackground';
import { Text } from 'react-native';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>{children}</View>
    ),
  };
});

describe('StarryBackground', () => {
  it('testID="starry-background" が存在する', () => {
    const { getByTestId } = render(
      <StarryBackground><Text>test</Text></StarryBackground>
    );
    expect(getByTestId('starry-background')).toBeTruthy();
  });

  it('LinearGradient が描画される (testID="starry-gradient")', () => {
    const { getByTestId } = render(
      <StarryBackground><Text>test</Text></StarryBackground>
    );
    expect(getByTestId('starry-gradient')).toBeTruthy();
  });

  it('子要素が正しく表示される', () => {
    const { getByText } = render(
      <StarryBackground><Text>テスト子要素</Text></StarryBackground>
    );
    expect(getByText('テスト子要素')).toBeTruthy();
  });

  it('星のドット要素が存在する', () => {
    const { getByTestId } = render(
      <StarryBackground><Text>test</Text></StarryBackground>
    );
    expect(getByTestId('star-dot-0')).toBeTruthy();
    expect(getByTestId('star-dot-1')).toBeTruthy();
  });

  it('クラッシュしない', () => {
    expect(() =>
      render(<StarryBackground><Text>test</Text></StarryBackground>)
    ).not.toThrow();
  });
});
