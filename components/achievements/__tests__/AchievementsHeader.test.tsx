import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: {
      text: '#fff',
      textSecondary: '#999',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.22)',
    },
  }),
}));

import { AchievementsHeader } from '../AchievementsHeader';

describe('AchievementsHeader', () => {
  it('"Achievements" タイトルを表示する', () => {
    render(<AchievementsHeader onClose={jest.fn()} />);
    expect(screen.getByText('Achievements')).toBeTruthy();
  });

  it('Xボタンをタップすると onClose が呼ばれる', () => {
    const onClose = jest.fn();
    render(<AchievementsHeader onClose={onClose} />);
    fireEvent.press(screen.getByTestId('achievements-header-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('close ボタンに円形背景と border が適用される（押せると分かる）', () => {
    render(<AchievementsHeader onClose={jest.fn()} />);
    const btn = screen.getByTestId('achievements-header-close');
    const flat = StyleSheet.flatten(btn.props.style);
    expect(flat.borderWidth).toBe(1);
    expect(flat.borderRadius).toBeGreaterThan(0);
    expect(flat.backgroundColor).toBe('rgba(255,255,255,0.06)');
    expect(flat.borderColor).toBe('rgba(255,255,255,0.22)');
  });
});
