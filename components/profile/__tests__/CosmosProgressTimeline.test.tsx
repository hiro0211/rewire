import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CosmosProgressTimeline } from '../CosmosProgressTimeline';
import { CHAPTER_IDS } from '@/constants/badges/BadgeChapter';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#999',
      surface: '#111',
      primary: '#0af',
    },
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    isJapanese: true,
  }),
}));

describe('CosmosProgressTimeline', () => {
  const mockAchievements = [
    { badge: { id: 'Stardust', day: 0 }, isUnlocked: true },
    { badge: { id: 'Nebula', day: 1 }, isUnlocked: true },
    { badge: { id: 'Protostar', day: 3 }, isUnlocked: true },
    { badge: { id: 'Ignition', day: 7 }, isUnlocked: true },
    { badge: { id: 'MainSequence', day: 14 }, isUnlocked: true },
    { badge: { id: 'Radiance', day: 21 }, isUnlocked: false },
  ];

  it('6つのチャプターセクションが表示される', () => {
    render(<CosmosProgressTimeline streak={15} achievements={mockAchievements as any} />);
    for (const id of CHAPTER_IDS) {
      expect(screen.getByTestId(`chapter-section-${id}`)).toBeTruthy();
    }
  });

  it('18個のマイルストーンが表示される', () => {
    render(<CosmosProgressTimeline streak={15} achievements={mockAchievements as any} />);
    const milestones = screen.getAllByTestId(/^milestone-/);
    expect(milestones).toHaveLength(18);
  });

  it('streak=15のとき、ignitionチャプターがアクティブ', () => {
    render(<CosmosProgressTimeline streak={15} achievements={mockAchievements as any} />);
    expect(screen.getByTestId('chapter-section-ignition')).toBeTruthy();
  });

  it('アンロック済みバッジが正しくマークされる', () => {
    render(<CosmosProgressTimeline streak={15} achievements={mockAchievements as any} />);
    expect(screen.getByTestId('milestone-Stardust-unlocked')).toBeTruthy();
    expect(screen.getByTestId('milestone-Nebula-unlocked')).toBeTruthy();
  });
});
