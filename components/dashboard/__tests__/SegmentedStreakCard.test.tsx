import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SegmentedStreakCard } from '../SegmentedStreakCard';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      cyan: '#00D4FF',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.12)',
    },
    glow: { purple: 'rgba(139, 92, 246, 0.3)' },
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'dashboard.elapsed': '経過時間',
        'streak.consecutiveDays': '連続日数',
        'streak.goal': '目標',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('SegmentedStreakCard', () => {
  it('3セグメントがレンダリングされる', () => {
    render(
      <SegmentedStreakCard
        elapsed="2日15時間31分"
        streakDays={15}
        goalDays={90}
      />
    );
    expect(screen.getByTestId('segmented-streak-card')).toBeTruthy();
    expect(screen.getByText('経過時間')).toBeTruthy();
    expect(screen.getByText('連続日数')).toBeTruthy();
    expect(screen.getByText('目標')).toBeTruthy();
  });

  it('経過時間の値が表示される', () => {
    render(
      <SegmentedStreakCard
        elapsed="2日15時間31分"
        streakDays={15}
        goalDays={90}
      />
    );
    expect(screen.getByText('2日15時間31分')).toBeTruthy();
  });

  it('ストリーク日数が表示される', () => {
    render(
      <SegmentedStreakCard
        elapsed="0分"
        streakDays={42}
        goalDays={90}
      />
    );
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('目標日数が表示される', () => {
    render(
      <SegmentedStreakCard
        elapsed="0分"
        streakDays={0}
        goalDays={90}
      />
    );
    expect(screen.getByText('90')).toBeTruthy();
  });
});
