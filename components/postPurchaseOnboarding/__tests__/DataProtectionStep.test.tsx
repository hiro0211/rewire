import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DataProtectionStep } from '../DataProtectionStep';

describe('DataProtectionStep', () => {
  it('データが Apple に保護されている旨の本文が表示される', () => {
    const { getByText } = render(<DataProtectionStep onNext={jest.fn()} />);
    expect(getByText(/Apple に保護され/)).toBeTruthy();
  });

  it('安心を伝える文言が含まれる', () => {
    const { getByText } = render(<DataProtectionStep onNext={jest.fn()} />);
    expect(getByText(/ご安心ください/)).toBeTruthy();
  });

  it('「次へ」タップで onNext を呼ぶ', () => {
    const onNext = jest.fn();
    const { getByTestId } = render(<DataProtectionStep onNext={onNext} />);
    fireEvent.press(getByTestId('data-protection-next'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
