import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StreakCard } from '../StreakCard';

const mockUpdateUser = jest.fn();

jest.mock('@/hooks/dashboard/useStreak', () => ({
  useStreak: () => ({
    streak: 7,
    goal: 30,
    progress: 7 / 30,
    streakStartDate: '2026-02-17',
  }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    updateUser: mockUpdateUser,
  }),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => (
      <View
        testID="date-picker"
        {...props}
        onChange={(e: any) =>
          props.onChange?.(e, props.value || new Date('2026-02-17'))
        }
      />
    ),
  };
});

describe('StreakCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('鉛筆アイコン（streak-edit-button）が表示される', () => {
    const { getByTestId } = render(<StreakCard />);
    expect(getByTestId('streak-edit-button')).toBeTruthy();
  });

  it('鉛筆アイコンをタップすると StreakEditModal が表示される', () => {
    const { getByTestId, getByText } = render(<StreakCard />);
    fireEvent.press(getByTestId('streak-edit-button'));
    expect(getByText('開始日を編集')).toBeTruthy();
  });

  it('モーダルで保存すると updateUser が streakStartDate 付きで呼ばれる', () => {
    const { getByTestId, getByText } = render(<StreakCard />);
    fireEvent.press(getByTestId('streak-edit-button'));
    fireEvent.press(getByText('保存'));
    expect(mockUpdateUser).toHaveBeenCalledWith({
      streakStartDate: '2026-02-17',
    });
  });
});
