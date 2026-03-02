import React from 'react';
import { render } from '@testing-library/react-native';
import { StarryBackground } from '../StarryBackground';
import { Text } from 'react-native';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, testID, colors, ...props }: any) => (
      <View testID={testID} colors={colors} {...props}>{children}</View>
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

  it('gradientColors prop でカスタムグラデーションが適用される', () => {
    const customColors = ['#0A0A0F', '#1a1a3e', '#2d1b4e'];
    const { getByTestId } = render(
      <StarryBackground gradientColors={customColors}>
        <Text>test</Text>
      </StarryBackground>
    );
    const gradient = getByTestId('starry-gradient');
    expect(gradient.props.colors).toEqual(customColors);
  });

  it('デフォルトではnavyグラデーションが使われる', () => {
    const { getByTestId } = render(
      <StarryBackground><Text>test</Text></StarryBackground>
    );
    const gradient = getByTestId('starry-gradient');
    expect(gradient.props.colors).toEqual(['#0B1026', '#0D1B2A', '#121A30']);
  });

  it('showStars={false} で星が非表示になる', () => {
    const { queryByTestId } = render(
      <StarryBackground showStars={false}>
        <Text>test</Text>
      </StarryBackground>
    );
    expect(queryByTestId('star-dot-0')).toBeNull();
  });
});
