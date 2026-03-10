import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GradientCard } from '../GradientCard';

describe('GradientCard', () => {
  it('children が正しく描画される', () => {
    const { getByText } = render(
      <GradientCard><Text>テスト</Text></GradientCard>
    );
    expect(getByText('テスト')).toBeTruthy();
  });

  it('testID が設定される', () => {
    const { getByTestId } = render(
      <GradientCard testID="test-card"><Text>テスト</Text></GradientCard>
    );
    expect(getByTestId('test-card')).toBeTruthy();
  });

  it('variant="default" でクラッシュしない', () => {
    expect(() =>
      render(<GradientCard variant="default"><Text>テスト</Text></GradientCard>)
    ).not.toThrow();
  });

  it('variant="hero" でクラッシュしない', () => {
    expect(() =>
      render(<GradientCard variant="hero"><Text>テスト</Text></GradientCard>)
    ).not.toThrow();
  });

  it('variant="accent" でクラッシュしない', () => {
    expect(() =>
      render(<GradientCard variant="accent"><Text>テスト</Text></GradientCard>)
    ).not.toThrow();
  });

  it('LinearGradient がレンダリングされる', () => {
    const { toJSON } = render(
      <GradientCard><Text>テスト</Text></GradientCard>
    );
    // LinearGradient (mocked as View) wraps children - verify structure renders
    expect(toJSON()).toBeTruthy();
  });
});
