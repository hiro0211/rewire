import React from 'react';
import { render } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/hooks/achievements/useAchievements', () => ({
  useAchievements: () => ({ unlocked: [] }),
}));

jest.mock('@/hooks/dashboard/useStreak', () => ({
  useStreak: () => ({ streak: 15 }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: { nickname: 'TestUser', createdAt: '2026-01-01T00:00:00Z' } }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#fff', textSecondary: '#999', primary: '#0af' },
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (key === 'profile.joinDate') return `Rewire参加: ${params?.date}`;
      if (key === 'profile.defaultName') return 'ユーザー';
      return key;
    },
    isJapanese: true,
  }),
}));

jest.mock('@/components/dashboard/AnimatedOrb', () => {
  const { View } = require('react-native');
  return { AnimatedOrb: (props: Record<string, unknown>) => <View testID="animated-orb" {...props} /> };
});

import { ProfileHeader } from '../ProfileHeader';

describe('ProfileHeader', () => {
  it('AnimatedOrbをレンダリングする', () => {
    const { getByTestId } = render(<ProfileHeader />);
    expect(getByTestId('animated-orb')).toBeTruthy();
  });

  it('バッジ名を表示する（streak=15 → MainSequence → 主系列星）', () => {
    const { getByText } = render(<ProfileHeader />);
    expect(getByText('主系列星')).toBeTruthy();
  });

  it('ニックネームを表示する', () => {
    const { getByText } = render(<ProfileHeader />);
    expect(getByText('TestUser')).toBeTruthy();
  });
});
