import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WelcomeStep } from '../steps/WelcomeStep';

describe('WelcomeStep', () => {
  const mockOnStart = jest.fn();

  beforeEach(() => {
    mockOnStart.mockClear();
  });

  it('Rewireロゴ画像が表示される', () => {
    const { getByTestId } = render(<WelcomeStep onStart={mockOnStart} />);
    expect(getByTestId('rewire-logo')).toBeTruthy();
  });

  it('「Rewire」のアプリ名テキストが表示される', () => {
    const { getByText } = render(<WelcomeStep onStart={mockOnStart} />);
    expect(getByText('Rewire')).toBeTruthy();
  });

  it('「ようこそ！」のタイトルが表示される', () => {
    const { getByText } = render(<WelcomeStep onStart={mockOnStart} />);
    expect(getByText('ようこそ！')).toBeTruthy();
  });

  it('依存度チェックの説明文が表示される', () => {
    const { getByText } = render(<WelcomeStep onStart={mockOnStart} />);
    expect(getByText(/まずはポルノの依存度を/)).toBeTruthy();
    expect(getByText(/チェックしてみましょう！/)).toBeTruthy();
  });

  it('星5つのアイコンが表示される', () => {
    const { getByTestId } = render(<WelcomeStep onStart={mockOnStart} />);
    expect(getByTestId('star-rating')).toBeTruthy();
  });

  it('「チェックを始める」ボタンが表示される', () => {
    const { getByText } = render(<WelcomeStep onStart={mockOnStart} />);
    expect(getByText('チェックを始める')).toBeTruthy();
  });

  it('ボタンを押すとonStartが呼ばれる', () => {
    const { getByText } = render(<WelcomeStep onStart={mockOnStart} />);
    fireEvent.press(getByText('チェックを始める'));
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('プライバシーカードは表示されない', () => {
    const { queryByText } = render(<WelcomeStep onStart={mockOnStart} />);
    expect(queryByText(/端末内にのみ保存/)).toBeNull();
  });
});
