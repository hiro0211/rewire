import React from 'react';
import { render } from '@testing-library/react-native';

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

jest.mock('@/components/achievements/BadgeOrb', () => {
  const { View } = require('react-native');
  return { BadgeOrb: () => <View testID="badge-orb" /> };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#fff', textSecondary: '#999', background: '#000' },
  }),
}));

import { BadgeUnlockModal } from '../BadgeUnlockModal';

const badge: any = {
  id: 'earth',
  chapter: 'terrestrial',
  nameJa: '地球',
  message: 'メッセージ',
  colors: { core: '#fff', mid: '#fff', outer: '#fff', glow: '#88f' },
};

describe('BadgeUnlockModal analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('バッジ表示時に badge_unlocked を badge_id/chapter 付きで送信する', () => {
    render(<BadgeUnlockModal badge={badge} onDismiss={jest.fn()} />);

    expect(mockTrackEvent).toHaveBeenCalledWith('badge_unlocked', {
      badge_id: 'earth',
      chapter: 'terrestrial',
    });
  });

  it('badge が null の場合は送信しない', () => {
    render(<BadgeUnlockModal badge={null} onDismiss={jest.fn()} />);

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });
});
