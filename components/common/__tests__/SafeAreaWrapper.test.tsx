import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaWrapper } from '../SafeAreaWrapper';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, colors, testID, ...props }: any) => (
      <View testID={testID || 'linear-gradient'} data-colors={JSON.stringify(colors)} {...props}>
        {children}
      </View>
    ),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { background: '#0A0A0F' },
    gradients: { background: ['#0A0A0F', '#1a1a3e', '#2d1b4e'] },
    isDark: true,
  }),
}));

describe('SafeAreaWrapper', () => {
  it('LinearGradient がレンダリングされる', () => {
    const { getByTestId } = render(
      <SafeAreaWrapper><Text>テスト</Text></SafeAreaWrapper>
    );
    expect(getByTestId('linear-gradient')).toBeTruthy();
  });

  it('children が正しく描画される', () => {
    const { getByText } = render(
      <SafeAreaWrapper><Text>コンテンツ</Text></SafeAreaWrapper>
    );
    expect(getByText('コンテンツ')).toBeTruthy();
  });

  it('gradients.background の色が LinearGradient に渡される', () => {
    const { getByTestId } = render(
      <SafeAreaWrapper><Text>テスト</Text></SafeAreaWrapper>
    );
    const gradient = getByTestId('linear-gradient');
    expect(gradient.props['data-colors']).toBe(
      JSON.stringify(['#0A0A0F', '#1a1a3e', '#2d1b4e'])
    );
  });
});
