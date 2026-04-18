import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AnimatedOrb } from '../AnimatedOrb';
import { CHAPTER_IDS } from '@/constants/badges/BadgeChapter';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

const testColors: BadgeColorTriad = {
  core: '#B8A9D4',
  mid: '#D0C4E4',
  outer: '#7B68AE',
  glow: '#E8E0F0',
};

describe('AnimatedOrb', () => {
  it('コンテナをレンダリングする', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" />);
    expect(screen.getByTestId('animated-orb')).toBeTruthy();
  });

  it('全6チャプターでレンダリングできる', () => {
    for (const chapter of CHAPTER_IDS) {
      const { unmount } = render(<AnimatedOrb colors={testColors} chapterId={chapter} />);
      expect(screen.getByTestId('animated-orb')).toBeTruthy();
      unmount();
    }
  });

  it('sizeプロパティを受け取れる', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" size={150} />);
    expect(screen.getByTestId('animated-orb')).toBeTruthy();
  });

  it('3層のグローエフェクトを表示する', () => {
    render(<AnimatedOrb colors={testColors} chapterId="terrestrial" />);
    expect(screen.getByTestId('orb-glow-inner')).toBeTruthy();
    expect(screen.getByTestId('orb-glow-outer')).toBeTruthy();
    expect(screen.getByTestId('orb-pulse-ring')).toBeTruthy();
  });

  it('パーティクルエフェクトを表示する', () => {
    render(<AnimatedOrb colors={testColors} chapterId="outerPlanets" />);
    expect(screen.getByTestId('orb-particles')).toBeTruthy();
  });

  it('Pressableが存在する', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" />);
    expect(screen.getByTestId('orb-pressable')).toBeTruthy();
  });

  it('onPress が発火する', () => {
    const onPress = jest.fn();
    render(<AnimatedOrb colors={testColors} chapterId="birth" onPress={onPress} />);
    fireEvent.press(screen.getByTestId('orb-pressable'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('onLongPress が発火する', () => {
    const onLongPress = jest.fn();
    render(<AnimatedOrb colors={testColors} chapterId="birth" onLongPress={onLongPress} />);
    fireEvent(screen.getByTestId('orb-pressable'), 'onLongPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('波紋エフェクト要素が存在する', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" />);
    expect(screen.getByTestId('orb-tap-ripple')).toBeTruthy();
  });
});
