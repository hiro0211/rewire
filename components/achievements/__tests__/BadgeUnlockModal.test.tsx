import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { BadgeUnlockModal } from '../BadgeUnlockModal';
import type { NeuralBadgeDefinition } from '@/constants/badges/BADGE_DEFINITIONS';

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Svg: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Ellipse: (props: any) => <View testID="svg-ellipse" {...props} />,
    Defs: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    RadialGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Stop: (props: any) => <View {...props} />,
    Rect: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
    Path: (props: any) => <View {...props} />,
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: { text: '#fff', textSecondary: '#999', background: '#000' },
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

const MOCK_BADGE: NeuralBadgeDefinition = {
  id: 'nebula',
  day: 1,
  chapter: 'birth',
  nameJa: '星雲',
  nameEn: 'Nebula',
  message: 'ガスと塵が集まり始めた。最初の一歩。',
  visual: '紫がかった雲が渦を巻く',
  neural: '最初の24時間 — ドーパミン受容体が回復を開始',
  colors: { core: '#B8A9D4', mid: '#D0C4E4', outer: '#7B68AE', glow: '#E8E0F0' },
};

describe('BadgeUnlockModal', () => {
  it('バッジ名（日本語）が表示される', () => {
    render(
      <BadgeUnlockModal badge={MOCK_BADGE} onDismiss={jest.fn()} />,
    );
    expect(screen.getByText('星雲')).toBeTruthy();
  });

  it('バッジの説明文が表示される', () => {
    render(
      <BadgeUnlockModal badge={MOCK_BADGE} onDismiss={jest.fn()} />,
    );
    expect(screen.getByText(MOCK_BADGE.message)).toBeTruthy();
  });

  it('閉じるボタンが表示される', () => {
    render(
      <BadgeUnlockModal badge={MOCK_BADGE} onDismiss={jest.fn()} />,
    );
    expect(screen.getByTestId('badge-unlock-dismiss')).toBeTruthy();
  });

  it('閉じるボタンを押すと onDismiss が呼ばれる', () => {
    const onDismiss = jest.fn();
    render(
      <BadgeUnlockModal badge={MOCK_BADGE} onDismiss={onDismiss} />,
    );
    fireEvent.press(screen.getByTestId('badge-unlock-dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('badge=null のとき何も描画されない', () => {
    const { toJSON } = render(
      <BadgeUnlockModal badge={null} onDismiss={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });
});
