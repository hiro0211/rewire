import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light' },
}));

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
        'dashboard.relapses': 'リセット',
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
        relapseCount={2}
        goalDays={90}
      />
    );
    expect(screen.getByTestId('segmented-streak-card')).toBeTruthy();
    expect(screen.getByText('リセット')).toBeTruthy();
    expect(screen.getByText('経過時間')).toBeTruthy();
    expect(screen.getByText('目標')).toBeTruthy();
  });

  it('経過時間の値が表示される', () => {
    render(
      <SegmentedStreakCard
        elapsed="2日15時間31分"
        relapseCount={2}
        goalDays={90}
      />
    );
    expect(screen.getByText('2日15時間31分')).toBeTruthy();
  });

  it('リセット回数が表示される', () => {
    render(
      <SegmentedStreakCard
        elapsed="0分"
        relapseCount={5}
        goalDays={90}
      />
    );
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('目標日数が表示される', () => {
    render(
      <SegmentedStreakCard
        elapsed="0分"
        relapseCount={0}
        goalDays={90}
      />
    );
    expect(screen.getByText('90')).toBeTruthy();
  });

  it('リセット0回のとき0が表示される', () => {
    render(
      <SegmentedStreakCard
        elapsed="1日0時間0分"
        relapseCount={0}
        goalDays={30}
      />
    );
    expect(screen.getByText('0')).toBeTruthy();
  });

  describe('振り返り完了ゲート', () => {
    it('todayReflectionCompleted=false のとき 未完了バッジが表示される', () => {
      render(
        <SegmentedStreakCard
          elapsed="1日0時間0分"
          relapseCount={0}
          goalDays={30}
          todayReflectionCompleted={false}
        />
      );
      expect(screen.getByTestId('reflection-pending-badge')).toBeTruthy();
    });

    it('todayReflectionCompleted=true のとき 未完了バッジは表示されない', () => {
      render(
        <SegmentedStreakCard
          elapsed="1日0時間0分"
          relapseCount={0}
          goalDays={30}
          todayReflectionCompleted={true}
        />
      );
      expect(screen.queryByTestId('reflection-pending-badge')).toBeNull();
    });

    it('todayReflectionCompleted=true で初回マウント時は haptic が発火しない（transition 判定）', () => {
      const Haptics = require('expo-haptics');
      render(
        <SegmentedStreakCard
          elapsed="1日0時間0分"
          relapseCount={0}
          goalDays={30}
          todayReflectionCompleted={true}
        />
      );
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    });

    it('false → true の transition で haptic が発火する', () => {
      const Haptics = require('expo-haptics');
      const { rerender } = render(
        <SegmentedStreakCard
          elapsed="1日0時間0分"
          relapseCount={0}
          goalDays={30}
          todayReflectionCompleted={false}
        />
      );
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();

      rerender(
        <SegmentedStreakCard
          elapsed="1日0時間0分"
          relapseCount={0}
          goalDays={30}
          todayReflectionCompleted={true}
        />
      );

      expect(Haptics.notificationAsync).toHaveBeenCalled();
    });
  });
});
