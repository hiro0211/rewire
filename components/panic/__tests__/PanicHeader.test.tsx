import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PanicHeader } from '../PanicHeader';

describe('PanicHeader', () => {
  it('"Rewire" ロゴと "パニックボタン" ラベルを表示する', () => {
    const { getByText } = render(<PanicHeader onClose={jest.fn()} />);
    expect(getByText('Rewire')).toBeTruthy();
    expect(getByText('パニックボタン')).toBeTruthy();
  });

  it('閉じるボタン押下で onClose が呼ばれる', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<PanicHeader onClose={onClose} />);
    fireEvent.press(getByTestId('panic-header-close'));
    expect(onClose).toHaveBeenCalled();
  });
});
