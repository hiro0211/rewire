import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LastViewedDateStep } from '../LastViewedDateStep';

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Picker = ({ children, selectedValue, onValueChange, testID }: any) => (
    <View testID={testID || 'picker'}>
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

describe('LastViewedDateStep', () => {
  const defaultProps = {
    selectedYear: 2026,
    selectedMonth: 2,
    selectedDay: 12,
    onYearChange: jest.fn(),
    onMonthChange: jest.fn(),
    onDayChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトル「最後にポルノを見たのはいつですか？」が表示される', () => {
    const { getByText } = render(<LastViewedDateStep {...defaultProps} />);
    expect(getByText(/最後にポルノを見たのは/)).toBeTruthy();
  });

  it('3つのピッカーが表示される', () => {
    const { getByTestId } = render(<LastViewedDateStep {...defaultProps} />);
    expect(getByTestId('year-picker')).toBeTruthy();
    expect(getByTestId('month-picker')).toBeTruthy();
    expect(getByTestId('day-picker')).toBeTruthy();
  });

  it('経過日数テキストが表示される', () => {
    const { getByText } = render(<LastViewedDateStep {...defaultProps} />);
    expect(getByText(/ポルノなしの継続日数は/)).toBeTruthy();
    expect(getByText(/から始まります。/)).toBeTruthy();
  });

  it('年を選択するとonYearChangeが呼ばれる', () => {
    const onYearChange = jest.fn();
    const { getByText } = render(
      <LastViewedDateStep {...defaultProps} onYearChange={onYearChange} />
    );
    fireEvent.press(getByText('2025'));
    expect(onYearChange).toHaveBeenCalledWith(2025);
  });

  it('月を選択するとonMonthChangeが呼ばれる', () => {
    const onMonthChange = jest.fn();
    const { getByText } = render(
      <LastViewedDateStep {...defaultProps} onMonthChange={onMonthChange} />
    );
    fireEvent.press(getByText('3月'));
    expect(onMonthChange).toHaveBeenCalledWith(3);
  });

  it('日を選択するとonDayChangeが呼ばれる', () => {
    const onDayChange = jest.fn();
    const { getByText } = render(
      <LastViewedDateStep {...defaultProps} onDayChange={onDayChange} />
    );
    fireEvent.press(getByText('15日'));
    expect(onDayChange).toHaveBeenCalledWith(15);
  });
});
