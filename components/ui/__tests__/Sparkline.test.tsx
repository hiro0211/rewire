import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    useAnimatedProps: () => ({}),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    Easing: { out: (f: any) => f, quad: (v: number) => v },
  };
});

jest.mock('react-native-svg', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View testID="svg-root" {...props}>{children}</View>,
    Polyline: (props: any) => <View testID="svg-polyline" />,
    Circle: (props: any) => <View testID="svg-circle" />,
    Path: (props: any) => <View testID="svg-path" />,
    Line: (props: any) => <View testID="svg-line" />,
    Text: (props: any) => <Text>{props.children}</Text>,
  };
});

import { Sparkline } from '../Sparkline';

describe('Sparkline', () => {
  it('データが1件未満のとき SVG を描画しない（Viewのみ）', () => {
    const { queryByTestId } = render(
      <Sparkline data={[]} color="#00D4FF" width={100} height={32} />
    );
    expect(queryByTestId('svg-root')).toBeNull();
  });

  it('データが1件のとき SVG を描画しない', () => {
    const { queryByTestId } = render(
      <Sparkline data={[3]} color="#00D4FF" width={100} height={32} />
    );
    expect(queryByTestId('svg-root')).toBeNull();
  });

  it('データが2件以上のとき SVG を描画する', () => {
    const { getByTestId } = render(
      <Sparkline data={[1, 2, 3]} color="#00D4FF" width={100} height={32} />
    );
    expect(getByTestId('svg-root')).toBeTruthy();
  });

  it('ポリラインが描画される', () => {
    const { getByTestId } = render(
      <Sparkline data={[1, 2, 3, 4, 5]} color="#00D4FF" width={100} height={32} />
    );
    expect(getByTestId('svg-polyline')).toBeTruthy();
  });

  it('エンドポイントの丸印が描画される', () => {
    const { getByTestId } = render(
      <Sparkline data={[1, 2, 3]} color="#00D4FF" width={100} height={32} />
    );
    expect(getByTestId('svg-circle')).toBeTruthy();
  });

  it('全値が同じでもクラッシュしない（range=0 のケース）', () => {
    expect(() =>
      render(<Sparkline data={[5, 5, 5, 5]} color="#00D4FF" width={100} height={32} />)
    ).not.toThrow();
  });

  it('width と height の指定サイズでレンダリングされる', () => {
    const { toJSON } = render(
      <Sparkline data={[1, 2, 3]} color="#FF0000" width={200} height={64} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('色プロパティが渡されてもクラッシュしない', () => {
    expect(() =>
      render(<Sparkline data={[1, 3, 2, 4]} color="#3DD68C" width={80} height={24} />)
    ).not.toThrow();
  });
});
