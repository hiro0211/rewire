import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OrbSoftAura } from '../OrbSoftAura';

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="svg-root" {...props} />,
    Svg: (props: any) => <View testID="svg-root" {...props} />,
    Defs: (props: any) => <View {...props} />,
    RadialGradient: (props: any) => <View testID="radial-gradient" {...props} />,
    Stop: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
  };
});

describe('OrbSoftAura', () => {
  it('コンテナを描画する', () => {
    render(<OrbSoftAura size={200} glowColor="#00D4FF" />);
    expect(screen.getByTestId('orb-soft-aura')).toBeTruthy();
  });

  it('SVGが存在する', () => {
    render(<OrbSoftAura size={200} glowColor="#00D4FF" />);
    expect(screen.getByTestId('svg-root')).toBeTruthy();
  });

  it('RadialGradientを使用している', () => {
    render(<OrbSoftAura size={200} glowColor="#00D4FF" />);
    expect(screen.getByTestId('radial-gradient')).toBeTruthy();
  });

  it('コンテナのサイズはsize * 2.0', () => {
    const size = 200;
    render(<OrbSoftAura size={size} glowColor="#00D4FF" />);
    const container = screen.getByTestId('orb-soft-aura');
    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;
    expect(style.width).toBe(size * 2.0);
    expect(style.height).toBe(size * 2.0);
  });

  it('pointerEventsがnone', () => {
    render(<OrbSoftAura size={200} glowColor="#00D4FF" />);
    const container = screen.getByTestId('orb-soft-aura');
    expect(container.props.pointerEvents).toBe('none');
  });
});
