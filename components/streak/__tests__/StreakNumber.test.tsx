import React from 'react';
import { render } from '@testing-library/react-native';
import { StreakNumber } from '../StreakNumber';

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, TextInput } = require('react-native');

  const Animated = {
    View: React.forwardRef(({ testID, style, children, ...props }: any, ref: any) => (
      <View testID={testID} style={style} ref={ref}>{children}</View>
    )),
    Text: React.forwardRef(({ testID, style, children, ...props }: any, ref: any) => (
      <View testID={testID} style={style} ref={ref}>{children}</View>
    )),
    createAnimatedComponent: (Component: any) => {
      return React.forwardRef((props: any, ref: any) => {
        const { animatedProps, ...rest } = props;
        return <Component {...rest} {...animatedProps} ref={ref} />;
      });
    },
  };

  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue: (val: number) => ({ value: val }),
    useAnimatedProps: (fn: () => any) => fn(),
    useAnimatedStyle: (fn: () => any) => fn(),
    withTiming: (val: number) => val,
    withSequence: (...args: any[]) => args[args.length - 1],
    withSpring: (val: number) => val,
    withDelay: (_d: number, val: any) => val,
    Easing: { out: (e: any) => e, cubic: (t: number) => t },
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#E8E8ED', textSecondary: '#6B6B7B' },
    gradients: { button: ['#8B5CF6', '#6D28D9'] },
    glow: { purple: 'rgba(139, 92, 246, 0.3)' },
    isDark: true,
  }),
}));

describe('StreakNumber', () => {
  it('testID="streak-number" が存在する', () => {
    const { getByTestId } = render(<StreakNumber streak={7} />);
    expect(getByTestId('streak-number')).toBeTruthy();
  });

  it('streak=0 でもクラッシュしない', () => {
    const { getByTestId } = render(<StreakNumber streak={0} />);
    expect(getByTestId('streak-number')).toBeTruthy();
  });

  it('streak=365 でもクラッシュしない', () => {
    const { getByTestId } = render(<StreakNumber streak={365} />);
    expect(getByTestId('streak-number')).toBeTruthy();
  });
});
