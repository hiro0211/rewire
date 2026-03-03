import React from 'react';
import { render } from '@testing-library/react-native';
import { WeeklyTracker } from '../WeeklyTracker';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>{children}</View>
    ),
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#16161E',
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      success: '#3DD68C',
      border: '#2A2A35',
    },
    gradients: { button: ['#8B5CF6', '#6D28D9'] },
    glow: { purple: 'rgba(139, 92, 246, 0.3)' },
    isDark: true,
  }),
}));

describe('WeeklyTracker', () => {
  it('7つの曜日ラベルが表示される', () => {
    const { getByText } = render(<WeeklyTracker streak={3} />);
    expect(getByText('月')).toBeTruthy();
    expect(getByText('水')).toBeTruthy();
    expect(getByText('金')).toBeTruthy();
  });

  it('testID="weekly-tracker" が存在する', () => {
    const { getByTestId } = render(<WeeklyTracker streak={0} />);
    expect(getByTestId('weekly-tracker')).toBeTruthy();
  });

  it('streak=0 でもクラッシュしない', () => {
    const { getByTestId } = render(<WeeklyTracker streak={0} />);
    expect(getByTestId('weekly-tracker')).toBeTruthy();
  });

  it('streak=100 でもクラッシュしない', () => {
    const { getByTestId } = render(<WeeklyTracker streak={100} />);
    expect(getByTestId('weekly-tracker')).toBeTruthy();
  });
});
