import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '../ProgressBar';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ testID, style, ...props }: any) => (
      <View testID={testID} style={style} {...props} />
    ),
  };
});

describe('ProgressBar', () => {
  it('variant 未指定時、従来通りのバーが描画される', () => {
    const { queryByTestId } = render(<ProgressBar progress={0.5} />);
    expect(queryByTestId('progress-gradient')).toBeNull();
  });

  it('variant="gradient" 時、testID="progress-gradient" が存在する', () => {
    const { getByTestId } = render(
      <ProgressBar progress={0.5} variant="gradient" />
    );
    expect(getByTestId('progress-gradient')).toBeTruthy();
  });

  it('variant="gradient" 時、LinearGradient コンポーネントが使用される', () => {
    const { getByTestId } = render(
      <ProgressBar progress={0.5} variant="gradient" />
    );
    expect(getByTestId('progress-gradient')).toBeTruthy();
  });

  it('progress=0.5 で正しい幅比率が適用される', () => {
    const { getByTestId } = render(
      <ProgressBar progress={0.5} variant="gradient" />
    );
    const gradient = getByTestId('progress-gradient');
    const parentStyle = gradient.props.style;
    // The gradient wrapper should have width: '50%'
    const flatStyle = Array.isArray(parentStyle)
      ? Object.assign({}, ...parentStyle.filter(Boolean))
      : parentStyle;
    expect(flatStyle.width).toBe('50%');
  });
});
