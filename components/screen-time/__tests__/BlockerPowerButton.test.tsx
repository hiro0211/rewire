import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BlockerPowerButton, ACTIVE_COLOR, INACTIVE_COLOR } from '../BlockerPowerButton';

function flattenStyle(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return style.reduce(
      (acc, s) => ({ ...acc, ...flattenStyle(s) }),
      {} as Record<string, unknown>,
    );
  }
  return (style ?? {}) as Record<string, unknown>;
}

describe('BlockerPowerButton', () => {
  it('enabled=false のとき赤（INACTIVE_COLOR）で描画される', () => {
    const { getByTestId } = render(
      <BlockerPowerButton enabled={false} isBusy={false} onPress={jest.fn()} />,
    );
    const style = flattenStyle(getByTestId('blocker-power-button').props.style);
    expect(style.backgroundColor).toBe(INACTIVE_COLOR);
  });

  it('enabled=true のとき緑（ACTIVE_COLOR）で描画される', () => {
    const { getByTestId } = render(
      <BlockerPowerButton enabled isBusy={false} onPress={jest.fn()} />,
    );
    const style = flattenStyle(getByTestId('blocker-power-button').props.style);
    expect(style.backgroundColor).toBe(ACTIVE_COLOR);
  });

  it('onPress タップでコールバックが呼ばれる', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <BlockerPowerButton enabled={false} isBusy={false} onPress={onPress} />,
    );
    fireEvent.press(getByTestId('blocker-power-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('isBusy のとき無効化され、タップしても onPress が呼ばれない', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <BlockerPowerButton enabled={false} isBusy onPress={onPress} />,
    );
    fireEvent.press(getByTestId('blocker-power-button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('testID を上書きできる', () => {
    const { getByTestId } = render(
      <BlockerPowerButton
        enabled={false}
        isBusy={false}
        onPress={jest.fn()}
        testID="custom-power"
      />,
    );
    expect(getByTestId('custom-power')).toBeTruthy();
  });
});
