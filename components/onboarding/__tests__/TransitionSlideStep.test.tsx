import React from 'react';
import { render } from '@testing-library/react-native';
import { TransitionSlideStep } from '../TransitionSlideStep';

describe('TransitionSlideStep', () => {
  it('メインテキストが表示される', () => {
    const { getByText } = render(<TransitionSlideStep />);
    expect(getByText(/ではポルノに毒されると/)).toBeTruthy();
    expect(getByText(/何が起きるのか？/)).toBeTruthy();
  });

  it('フックテキスト「具体的にみてみましょう。」が表示される', () => {
    const { getByText } = render(<TransitionSlideStep />);
    expect(getByText('具体的にみてみましょう。')).toBeTruthy();
  });

  it('警告アイコンが表示される', () => {
    const { getByTestId } = render(<TransitionSlideStep />);
    expect(getByTestId('warning-icon')).toBeTruthy();
  });

  it('アイコンコンテナにグローシャドウスタイルが適用される', () => {
    const { getByTestId } = render(<TransitionSlideStep />);
    const container = getByTestId('icon-container');
    const flatStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;
    expect(flatStyle.shadowColor).toBe('rgba(139, 92, 246, 0.3)');
    expect(flatStyle.shadowRadius).toBeGreaterThan(0);
    expect(flatStyle.width).toBe(96);
    expect(flatStyle.height).toBe(96);
  });
});
