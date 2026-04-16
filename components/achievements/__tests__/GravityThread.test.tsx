import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => (
      <View testID="svg-root" {...props}>
        {children}
      </View>
    ),
    Path: (props: any) => <View testID="svg-path" {...props} />,
  };
});

import { GravityThread } from '../GravityThread';

describe('GravityThread', () => {
  it('SVG要素を1つレンダリングする', () => {
    const { getByTestId } = render(
      <GravityThread color="#FFB547" isActive direction="left" />,
    );
    expect(getByTestId('svg-root')).toBeTruthy();
    expect(getByTestId('svg-path')).toBeTruthy();
  });

  it('isActive=true のとき stroke が props.color になる', () => {
    const { getByTestId } = render(
      <GravityThread color="#FFB547" isActive direction="right" />,
    );
    const path = getByTestId('svg-path');
    expect(path.props.stroke).toBe('#FFB547');
  });

  it('isActive=false のとき stroke が薄い白になる', () => {
    const { getByTestId } = render(
      <GravityThread color="#FFB547" isActive={false} direction="left" />,
    );
    const path = getByTestId('svg-path');
    expect(path.props.stroke).toBe('rgba(255,255,255,0.1)');
  });
});
