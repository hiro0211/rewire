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

describe('SafeAreaWrapper — edges prop', () => {
  it('edges={["top"]}のとき paddingBottom が 0 になる', () => {
    const { getByTestId } = render(
      <SafeAreaWrapper edges={['top']}><Text>テスト</Text></SafeAreaWrapper>
    );
    const gradient = getByTestId('linear-gradient');
    const flatStyle = Array.isArray(gradient.props.style)
      ? Object.assign({}, ...gradient.props.style)
      : gradient.props.style;
    expect(flatStyle.paddingTop).toBe(44);
    expect(flatStyle.paddingBottom).toBe(0);
  });

  it('edges未指定のとき top と bottom 両方が適用される', () => {
    const { getByTestId } = render(
      <SafeAreaWrapper><Text>テスト</Text></SafeAreaWrapper>
    );
    const gradient = getByTestId('linear-gradient');
    const flatStyle = Array.isArray(gradient.props.style)
      ? Object.assign({}, ...gradient.props.style)
      : gradient.props.style;
    expect(flatStyle.paddingTop).toBe(44);
    expect(flatStyle.paddingBottom).toBe(34);
  });
});

describe('SafeAreaWrapper — gradients.background が未定義の場合', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('colors.background のフォールバックカラーが使われる', () => {
    jest.doMock('@/hooks/useTheme', () => ({
      useTheme: () => ({
        colors: { background: '#FFFFFF' },
        gradients: { background: undefined },
        isDark: false,
      }),
    }));

    const { SafeAreaWrapper: FreshWrapper } = require('../SafeAreaWrapper');
    const { getByTestId } = render(
      <FreshWrapper><Text>フォールバック</Text></FreshWrapper>
    );
    const gradient = getByTestId('linear-gradient');
    expect(gradient.props['data-colors']).toBe(
      JSON.stringify(['#FFFFFF', '#FFFFFF'])
    );
  });
});
