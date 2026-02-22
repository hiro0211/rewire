import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationSetupStep } from '../NotificationSetupStep';

describe('NotificationSetupStep', () => {
  const defaultProps = {
    selectedTime: '22:00',
    onTimeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('デイリーチェックインの重要性を説明するタイトルが表示される', () => {
    const { getByText } = render(<NotificationSetupStep {...defaultProps} />);
    expect(getByText(/毎日の振り返り/)).toBeTruthy();
  });

  it('現在の選択時刻が表示される', () => {
    const { getByText } = render(<NotificationSetupStep {...defaultProps} />);
    expect(getByText('22:00')).toBeTruthy();
  });

  it('別の時刻で選択時刻が表示される', () => {
    const { getByText } = render(
      <NotificationSetupStep {...defaultProps} selectedTime="08:30" />
    );
    expect(getByText('08:30')).toBeTruthy();
  });

  it('時刻を選択するとonTimeChangeが呼ばれる', () => {
    const onTimeChange = jest.fn();
    const { getByText } = render(
      <NotificationSetupStep selectedTime="22:00" onTimeChange={onTimeChange} />
    );
    fireEvent.press(getByText('21:00'));
    expect(onTimeChange).toHaveBeenCalledWith('21:00');
  });

  it('「何時に振り返りますか？」の案内テキストが表示される', () => {
    const { getByText } = render(<NotificationSetupStep {...defaultProps} />);
    expect(getByText(/何時/)).toBeTruthy();
  });

  it('ストリーク継続の重要性に関する説明文が表示される', () => {
    const { getByText } = render(<NotificationSetupStep {...defaultProps} />);
    expect(getByText(/連続/)).toBeTruthy();
  });
});
