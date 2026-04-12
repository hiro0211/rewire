import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: { Text },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    withTiming: (v: any, _opts?: any, cb?: any) => {
      if (cb) cb();
      return v;
    },
  };
});

import { BreathingText } from '../BreathingText';

describe('BreathingText', () => {
  it('phase が inhale のとき "ゆっくり息を吸ってください" を表示する', () => {
    const { getByText } = render(<BreathingText phase="inhale" />);
    expect(getByText('ゆっくり息を吸ってください')).toBeTruthy();
  });

  it('phase が hold のとき "そのまま息を止めて" を表示する', () => {
    const { getByText } = render(<BreathingText phase="hold" />);
    expect(getByText('そのまま息を止めて')).toBeTruthy();
  });

  it('phase が exhale のとき "ゆっくり息を吐いてください" を表示する', () => {
    const { getByText } = render(<BreathingText phase="exhale" />);
    expect(getByText('ゆっくり息を吐いてください')).toBeTruthy();
  });

  it('phase が idle のとき null を返す', () => {
    const { toJSON } = render(<BreathingText phase="idle" />);
    expect(toJSON()).toBeNull();
  });
});
