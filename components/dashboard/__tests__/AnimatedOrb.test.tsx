import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AnimatedOrb } from '../AnimatedOrb';
import { CHAPTER_IDS } from '@/constants/badges/BadgeChapter';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

describe('AnimatedOrb', () => {
  it('コンテナをレンダリングする', () => {
    render(<AnimatedOrb chapterId="chaos" />);
    expect(screen.getByTestId('animated-orb')).toBeTruthy();
  });

  it('全6チャプターでレンダリングできる', () => {
    for (const chapter of CHAPTER_IDS) {
      const { unmount } = render(<AnimatedOrb chapterId={chapter} />);
      expect(screen.getByTestId('animated-orb')).toBeTruthy();
      unmount();
    }
  });

  it('sizeプロパティを受け取れる', () => {
    render(<AnimatedOrb chapterId="chaos" size={150} />);
    expect(screen.getByTestId('animated-orb')).toBeTruthy();
  });

  it('3層のグローエフェクトを表示する', () => {
    render(<AnimatedOrb chapterId="formation" />);
    expect(screen.getByTestId('orb-glow-inner')).toBeTruthy();
    expect(screen.getByTestId('orb-glow-outer')).toBeTruthy();
    expect(screen.getByTestId('orb-pulse-ring')).toBeTruthy();
  });

  it('パーティクルエフェクトを表示する', () => {
    render(<AnimatedOrb chapterId="life" />);
    expect(screen.getByTestId('orb-particles')).toBeTruthy();
  });

  it('Pressableが存在する', () => {
    render(<AnimatedOrb chapterId="chaos" />);
    expect(screen.getByTestId('orb-pressable')).toBeTruthy();
  });

  it('onPress が発火する', () => {
    const onPress = jest.fn();
    render(<AnimatedOrb chapterId="chaos" onPress={onPress} />);
    fireEvent.press(screen.getByTestId('orb-pressable'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('onLongPress が発火する', () => {
    const onLongPress = jest.fn();
    render(<AnimatedOrb chapterId="chaos" onLongPress={onLongPress} />);
    fireEvent(screen.getByTestId('orb-pressable'), 'onLongPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('波紋エフェクト要素が存在する', () => {
    render(<AnimatedOrb chapterId="chaos" />);
    expect(screen.getByTestId('orb-tap-ripple')).toBeTruthy();
  });
});
