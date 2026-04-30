import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#fff', textSecondary: '#999' },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ isJapanese: false }),
}));

jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  function IoniconsMock({ name }: any) {
    return <Text testID={`icon-${name}`}>{name}</Text>;
  }
  return IoniconsMock;
});

import { CalendarHeader } from '../CalendarHeader';

describe('CalendarHeader', () => {
  it('月名と前後ボタンを表示し、ボタンタップでコールバックが呼ばれる', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();
    const month = new Date('2026-04-15T12:00:00');

    const { getByTestId, getByText } = render(
      <CalendarHeader month={month} onPrev={onPrev} onNext={onNext} />
    );

    expect(getByText(/Apr/)).toBeTruthy();
    fireEvent.press(getByTestId('calendar-header-prev'));
    fireEvent.press(getByTestId('calendar-header-next'));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
