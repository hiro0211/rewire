import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NextBadgeProgress } from '../NextBadgeProgress';

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
    colors: { text: '#fff', textSecondary: '#999' },
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

describe('NextBadgeProgress', () => {
  it('次バッジが存在するとき次バッジ名が表示される', () => {
    // Day 1 → currentBadge: Nebula, next: Protostar
    render(<NextBadgeProgress currentDay={1} />);
    expect(screen.getByTestId('next-badge-name')).toBeTruthy();
    expect(screen.getByTestId('next-badge-name').props.children).toBe('原始星');
  });

  it('次バッジが存在するとき進捗バーが表示される', () => {
    render(<NextBadgeProgress currentDay={1} />);
    expect(screen.getByTestId('next-badge-progress-bar')).toBeTruthy();
  });

  it('最終バッジ到達済みのとき全バッジ達成テキストが表示される', () => {
    // 最終バッジは Cosmos (day=1095)
    render(<NextBadgeProgress currentDay={1095} />);
    expect(screen.getByTestId('next-badge-all-achieved')).toBeTruthy();
  });

  it('progress 0% のとき進捗バー幅が 0 である', () => {
    // Day 1 → Nebula, next=Protostar(day=3) → progress=(1-1)/(3-1)=0
    render(<NextBadgeProgress currentDay={1} />);
    const fill = screen.getByTestId('next-badge-progress-fill');
    const flat = Array.isArray(fill.props.style)
      ? Object.assign({}, ...fill.props.style.filter(Boolean))
      : fill.props.style;
    expect(flat.width).toBe('0%');
  });

  it('progress 50% のとき進捗バー幅が 50% である', () => {
    // Day 2 → Nebula(day=1), next=Protostar(day=3) → progress=(2-1)/(3-1)=0.5
    render(<NextBadgeProgress currentDay={2} />);
    const fill = screen.getByTestId('next-badge-progress-fill');
    const flat = Array.isArray(fill.props.style)
      ? Object.assign({}, ...fill.props.style.filter(Boolean))
      : fill.props.style;
    expect(flat.width).toBe('50%');
  });

  it('progress 25% のとき進捗バー幅が 25% である', () => {
    // Day 4 → protostar(day=3), next=moon(day=7) → (4-3)/(7-3)=0.25
    render(<NextBadgeProgress currentDay={4} />);
    const fill = screen.getByTestId('next-badge-progress-fill');
    const flat = Array.isArray(fill.props.style)
      ? Object.assign({}, ...fill.props.style.filter(Boolean))
      : fill.props.style;
    expect(flat.width).toBe('25%');
  });
});
