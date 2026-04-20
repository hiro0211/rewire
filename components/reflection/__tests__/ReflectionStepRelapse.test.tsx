import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReflectionStepRelapse } from '../ReflectionStepRelapse';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      primary: '#8B5CF6',
      contrastText: '#FFFFFF',
      surface: '#0F0F15',
      surfaceHighlight: '#1F1F2C',
      danger: '#EF4444',
    },
    gradients: {
      button: ['#8B5CF6', '#6D28D9'],
      sos: ['#EF4444', '#991B1B'],
      glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
    },
    glow: { purple: 'rgba(139,92,246,0.3)', danger: 'rgba(239,68,68,0.3)' },
    shadows: {
      small: {},
      medium: {},
      glowCard: {},
      sheet: {},
    },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
    locale: 'ja',
    isJapanese: true,
  }),
}));

describe('ReflectionStepRelapse', () => {
  const noSpy = jest.fn();
  const yesSpy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトルと2つの選択ボタンが表示される', () => {
    const { getByText, getByTestId } = render(
      <ReflectionStepRelapse onSelect={(v) => (v ? yesSpy() : noSpy())} />
    );

    expect(getByText('reflection.step1.title')).toBeTruthy();
    expect(getByTestId('reflection-step1-no')).toBeTruthy();
    expect(getByTestId('reflection-step1-yes')).toBeTruthy();
  });

  it('「見ていない」押下で onSelect(false) が呼ばれる', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(<ReflectionStepRelapse onSelect={onSelect} />);

    fireEvent.press(getByTestId('reflection-step1-no'));

    expect(onSelect).toHaveBeenCalledWith(false);
  });

  it('「見てしまった」押下で onSelect(true) が呼ばれる', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(<ReflectionStepRelapse onSelect={onSelect} />);

    fireEvent.press(getByTestId('reflection-step1-yes'));

    expect(onSelect).toHaveBeenCalledWith(true);
  });
});
