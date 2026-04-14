import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AnimatedOrb } from '../AnimatedOrb';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

describe('AnimatedOrb', () => {
  it('コンテナをレンダリングする', () => {
    render(<AnimatedOrb tierName="basic" />);
    expect(screen.getByTestId('animated-orb')).toBeTruthy();
  });

  it('各ティアでレンダリングできる', () => {
    const tiers = ['basic', 'weekly', 'monthly', 'milestone'] as const;
    for (const tier of tiers) {
      const { unmount } = render(<AnimatedOrb tierName={tier} />);
      expect(screen.getByTestId('animated-orb')).toBeTruthy();
      unmount();
    }
  });

  it('sizeプロパティを受け取れる', () => {
    render(<AnimatedOrb tierName="basic" size={150} />);
    expect(screen.getByTestId('animated-orb')).toBeTruthy();
  });

  it('グローエフェクトを表示する', () => {
    render(<AnimatedOrb tierName="monthly" />);
    expect(screen.getByTestId('orb-glow')).toBeTruthy();
  });
});
