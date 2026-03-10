import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import * as Haptics from 'expo-haptics';

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトルが表示される', () => {
    const { getByText } = render(<Button title="テスト" onPress={jest.fn()} />);
    expect(getByText('テスト')).toBeTruthy();
  });

  it('onPress が呼ばれる', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="テスト" onPress={onPress} />);
    fireEvent.press(getByText('テスト'));
    expect(onPress).toHaveBeenCalled();
  });

  it('タップ時にハプティクスが呼ばれる', () => {
    const { getByText } = render(<Button title="テスト" onPress={jest.fn()} />);
    fireEvent.press(getByText('テスト'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Light');
  });

  it('variant="gradient" でクラッシュしない', () => {
    expect(() =>
      render(<Button title="テスト" onPress={jest.fn()} variant="gradient" />)
    ).not.toThrow();
  });

  it('variant="gradient" + disabled でクラッシュしない', () => {
    expect(() =>
      render(<Button title="テスト" onPress={jest.fn()} variant="gradient" disabled />)
    ).not.toThrow();
  });

  it('disabled 時はタップできない', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="テスト" onPress={onPress} disabled />
    );
    fireEvent.press(getByText('テスト'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
