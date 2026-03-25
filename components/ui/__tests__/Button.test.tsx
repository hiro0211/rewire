import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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
  };
});

import { Button } from '../Button';
import * as Haptics from 'expo-haptics';

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
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Light');
  });

  it('variant="gradient" でクラッシュしない', () => {
    expect(() =>
      render(<Button title="テスト" onPress={jest.fn()} variant="gradient" />)
    ).not.toThrow();
  });

  it('variant="gradient" + disabled でクラッシュしない', () => {
    expect(() =>
      render(<Button title="テスト" onPress={jest.fn()} variant="gradient" disabled />)
    ).not.toThrow();
  });

  it('disabled 時はタップできない', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="テスト" onPress={onPress} disabled />
    );
    fireEvent.press(getByText('テスト'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('Animated.View ラッパーでレンダリングされる（プレスアニメーション）', () => {
    const { toJSON } = render(<Button title="テスト" onPress={jest.fn()} />);
    expect(toJSON()).toBeTruthy();
  });

  it('variant="primary" でクラッシュしない', () => {
    expect(() =>
      render(<Button title="テスト" onPress={jest.fn()} variant="primary" />)
    ).not.toThrow();
  });

  it('variant="secondary" でクラッシュしない', () => {
    expect(() =>
      render(<Button title="テスト" onPress={jest.fn()} variant="secondary" />)
    ).not.toThrow();
  });

  it('variant="danger" でクラッシュしない', () => {
    expect(() =>
      render(<Button title="テスト" onPress={jest.fn()} variant="danger" />)
    ).not.toThrow();
  });

  it('variant="ghost" でクラッシュしない', () => {
    expect(() =>
      render(<Button title="テスト" onPress={jest.fn()} variant="ghost" />)
    ).not.toThrow();
  });

  it('loading=true のとき ActivityIndicator が表示される', () => {
    const { UNSAFE_getByType } = render(
      <Button title="テスト" onPress={jest.fn()} loading />
    );
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });
});
