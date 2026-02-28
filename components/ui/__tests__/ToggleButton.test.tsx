import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ToggleButton } from '../ToggleButton';

const mockSelectionAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  selectionAsync: (...args: any[]) => mockSelectionAsync(...args),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('ToggleButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトルが表示される', () => {
    const { getByText } = render(
      <ToggleButton title="テスト" active={false} onPress={jest.fn()} />
    );
    expect(getByText('テスト')).toBeTruthy();
  });

  it('タップ時にハプティクス(selectionAsync)が呼ばれる', () => {
    const { getByText } = render(
      <ToggleButton title="テスト" active={false} onPress={jest.fn()} />
    );
    fireEvent.press(getByText('テスト'));
    expect(mockSelectionAsync).toHaveBeenCalled();
  });

  it('タップ時にonPressが呼ばれる', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ToggleButton title="テスト" active={false} onPress={onPress} />
    );
    fireEvent.press(getByText('テスト'));
    expect(onPress).toHaveBeenCalled();
  });
});
