import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AnimatedCard } from '../AnimatedCard';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.12)',
    },
    isDark: true,
  }),
}));

describe('AnimatedCard', () => {
  it('childrenを表示する', () => {
    render(
      <AnimatedCard>
        <Text>内容</Text>
      </AnimatedCard>
    );
    expect(screen.getByText('内容')).toBeTruthy();
  });

  it('testIDを渡せる', () => {
    render(
      <AnimatedCard testID="anim-card">
        <Text>test</Text>
      </AnimatedCard>
    );
    expect(screen.getByTestId('anim-card')).toBeTruthy();
  });

  it('delayプロパティを受け取れる', () => {
    render(
      <AnimatedCard delay={300}>
        <Text>delayed</Text>
      </AnimatedCard>
    );
    expect(screen.getByText('delayed')).toBeTruthy();
  });
});
