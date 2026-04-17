import React from 'react';
import { render, screen } from '@testing-library/react-native';

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
    useAnimatedReaction: () => {},
    withTiming: (v: any) => v,
    Easing: {
      out: (f: any) => f,
      cubic: (v: number) => v,
    },
  };
});

import { OrbTapRipple } from '../OrbTapRipple';

describe('OrbTapRipple', () => {
  const trigger = { value: 0 };

  it('testIDが存在する', () => {
    render(<OrbTapRipple size={200} color="#C9CBE0" trigger={trigger as any} />);
    expect(screen.getByTestId('orb-tap-ripple')).toBeTruthy();
  });

  it('pointerEvents="none" である', () => {
    render(<OrbTapRipple size={200} color="#C9CBE0" trigger={trigger as any} />);
    expect(screen.getByTestId('orb-tap-ripple').props.pointerEvents).toBe('none');
  });

  it('borderColor にcolor propsが反映される', () => {
    render(<OrbTapRipple size={150} color="#FF0000" trigger={trigger as any} />);
    const el = screen.getByTestId('orb-tap-ripple');
    const flatStyle = Array.isArray(el.props.style)
      ? Object.assign({}, ...el.props.style.filter(Boolean))
      : el.props.style;
    expect(flatStyle.borderColor).toBe('#FF0000');
  });

  it('sizeに基づいた寸法でレンダリングされる', () => {
    const size = 180;
    render(<OrbTapRipple size={size} color="#C9CBE0" trigger={trigger as any} />);
    const el = screen.getByTestId('orb-tap-ripple');
    const flatStyle = Array.isArray(el.props.style)
      ? Object.assign({}, ...el.props.style.filter(Boolean))
      : el.props.style;
    expect(flatStyle.width).toBe(size);
    expect(flatStyle.height).toBe(size);
    expect(flatStyle.borderRadius).toBe(size / 2);
  });
});
