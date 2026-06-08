import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Svg: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Ellipse: (props: any) => <View testID="svg-ellipse" {...props} />,
  };
});

import { SaturnRingOverlay } from '../SaturnRingOverlay';

describe('SaturnRingOverlay', () => {
  it('testID="saturn-ring" を持つコンテナを描画する', () => {
    render(<SaturnRingOverlay size={100} color="#FFF0C0" containerSize={160} />);
    expect(screen.getByTestId('saturn-ring')).toBeTruthy();
  });

  it('Ellipse を 2 本（前後の半楕円）描画する', () => {
    render(<SaturnRingOverlay size={100} color="#FFF0C0" containerSize={160} />);
    expect(screen.getAllByTestId('svg-ellipse')).toHaveLength(2);
  });

  it('color prop が両 Ellipse の stroke に渡る', () => {
    render(<SaturnRingOverlay size={100} color="#FFF0C0" containerSize={160} />);
    const ellipses = screen.getAllByTestId('svg-ellipse');
    for (const el of ellipses) {
      expect(el.props.stroke).toBe('#FFF0C0');
    }
  });

  it('リング幅は size * 1.45', () => {
    render(<SaturnRingOverlay size={100} color="#fff" containerSize={160} />);
    const container = screen.getByTestId('saturn-ring');
    const flat = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;
    expect(flat.width).toBeCloseTo(145);
  });
});
