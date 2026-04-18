import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PanicHeader } from '../PanicHeader';

describe('PanicHeader', () => {
  it('閉じるボタンのみ表示し、テキストは表示しない', () => {
    const { getByTestId, queryByText } = render(<PanicHeader onClose={jest.fn()} />);
    expect(getByTestId('panic-header-close')).toBeTruthy();
    expect(queryByText('Rewire')).toBeNull();
    expect(queryByText('パニックボタン')).toBeNull();
  });

  it('閉じるボタン押下で onClose が呼ばれる', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<PanicHeader onClose={onClose} />);
    fireEvent.press(getByTestId('panic-header-close'));
    expect(onClose).toHaveBeenCalled();
  });
});
