import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StatCard } from '../StatCard';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.12)',
      cyan: '#00D4FF',
    },
    isDark: true,
  }),
}));

describe('StatCard', () => {
  it('ラベルと値を表示する', () => {
    render(<StatCard label="STREAK" value="7 days" />);
    expect(screen.getByText('STREAK')).toBeTruthy();
    expect(screen.getByText('7 days')).toBeTruthy();
  });

  it('valueColorが適用される', () => {
    render(<StatCard label="RELAPSES" value="0" valueColor="#3DD68C" />);
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('testIDを渡せる', () => {
    render(<StatCard label="GOAL" value="30 days" testID="stat-goal" />);
    expect(screen.getByTestId('stat-goal')).toBeTruthy();
  });
});
