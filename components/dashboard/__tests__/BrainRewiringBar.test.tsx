import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { BrainRewiringBar } from '../BrainRewiringBar';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.12)',
      surfaceHighlight: '#1F1F2C',
    },
    gradients: {
      accent: ['#00D4FF', '#8B5CF6'],
    },
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'dashboard.brainRewiring': 'Brain Rewiring',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('BrainRewiringBar', () => {
  it('progress=0 のとき 0% を表示する', () => {
    render(<BrainRewiringBar progress={0} />);
    expect(screen.getByTestId('brain-rewiring-bar')).toBeTruthy();
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('progress=0.5 のとき 50% を表示する', () => {
    render(<BrainRewiringBar progress={0.5} />);
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('progress=1.0 のとき 100% を表示する', () => {
    render(<BrainRewiringBar progress={1} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('progress>1.0 のとき 100% にクランプされる', () => {
    render(<BrainRewiringBar progress={1.5} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('ラベルが表示される', () => {
    render(<BrainRewiringBar progress={0.3} />);
    expect(screen.getByText('Brain Rewiring')).toBeTruthy();
  });
});
