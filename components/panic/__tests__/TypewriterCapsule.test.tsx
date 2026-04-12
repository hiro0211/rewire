import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: { View, Text },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    withTiming: (v: any) => v,
    withSpring: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { in: (fn: any) => fn, out: (fn: any) => fn, quad: () => 0, bezier: () => 0 },
  };
});

import { TypewriterCapsule } from '../TypewriterCapsule';

describe('TypewriterCapsule', () => {
  it('displayedText を描画する', () => {
    const { getByText } = render(
      <TypewriterCapsule displayedText="後悔" phase="typing" />,
    );
    expect(getByText('後悔')).toBeTruthy();
  });

  it('displayedText が空文字のときでもクラッシュしない', () => {
    expect(() =>
      render(<TypewriterCapsule displayedText="" phase="entering" />),
    ).not.toThrow();
  });
});
