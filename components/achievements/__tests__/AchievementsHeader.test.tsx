import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: { text: '#fff', textSecondary: '#999' },
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
});
