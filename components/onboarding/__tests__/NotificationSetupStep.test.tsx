import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationSetupStep } from '../NotificationSetupStep';

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Picker = ({ children, selectedValue, onValueChange }: any) => (
    <View testID="picker">
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, {
          onPress: () => onValueChange(child.props.value),
          selected: child.props.value === selectedValue,
        })
      )}
    </View>
  );
  Picker.Item = ({ label, value, onPress }: any) => (
    <Text onPress={onPress}>{label}</Text>
  );
  return { Picker };
});

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
    expect(getByText(/毎日の振り返りが/)).toBeTruthy();
  });

  it('「何時に振り返りますか？」の案内テキストが表示される', () => {
    const { getByText } = render(<NotificationSetupStep {...defaultProps} />);
    expect(getByText(/何時/)).toBeTruthy();
  });

  it('説明文が表示される', () => {
    const { getAllByText } = render(<NotificationSetupStep {...defaultProps} />);
    expect(getAllByText(/振り返り/).length).toBeGreaterThan(0);
  });

  it('ピッカーが表示される', () => {
    const { getByTestId } = render(<NotificationSetupStep {...defaultProps} />);
    expect(getByTestId('picker')).toBeTruthy();
  });

  it('時刻を選択するとonTimeChangeが呼ばれる', () => {
    const onTimeChange = jest.fn();
    const { getByText } = render(
      <NotificationSetupStep selectedTime="22:00" onTimeChange={onTimeChange} />
    );
    fireEvent.press(getByText('21:00'));
    expect(onTimeChange).toHaveBeenCalledWith('21:00');
  });
});
