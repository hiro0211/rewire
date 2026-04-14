import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassCard } from '../GlassCard';

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.12)',
    },
    isDark: true,
  }),
}));

describe('GlassCard', () => {
  it('childrenを表示する', () => {
    render(
      <GlassCard>
        <Text>テスト内容</Text>
      </GlassCard>
    );
    expect(screen.getByText('テスト内容')).toBeTruthy();
  });

  it('testIDを渡せる', () => {
    render(
      <GlassCard testID="my-glass-card">
        <Text>内容</Text>
      </GlassCard>
    );
    expect(screen.getByTestId('my-glass-card')).toBeTruthy();
  });

  it('ダークモードでBlurViewをレンダリングする', () => {
    render(
      <GlassCard testID="glass-dark">
        <Text>Dark</Text>
      </GlassCard>
    );
    // BlurView is mocked as plain View, but should render children
    expect(screen.getByText('Dark')).toBeTruthy();
  });

  it('カスタムstyleを適用できる', () => {
    render(
      <GlassCard testID="glass-styled" style={{ marginTop: 10 }}>
        <Text>Styled</Text>
      </GlassCard>
    );
    expect(screen.getByTestId('glass-styled')).toBeTruthy();
  });
});
