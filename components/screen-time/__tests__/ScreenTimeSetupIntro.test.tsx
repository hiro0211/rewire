import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: require('@/constants/colorPalettes').DARK_COLORS,
    gradients: require('@/constants/colorPalettes').DARK_GRADIENTS,
    glow: require('@/constants/colorPalettes').DARK_GLOW,
    shadows: require('@/constants/colorPalettes').DARK_SHADOWS,
    mode: 'dark',
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'screenTime.title': 'ウェブ保護',
        'screenTime.intro': 'Screen Timeを使って全ブラウザのアダルトコンテンツをブロックします。',
        'screenTime.enableButton': 'スクリーンタイムを有効にする',
        'screenTime.skip': 'あとで設定する',
      };
      return map[key] ?? key;
    },
  }),
}));

import { ScreenTimeSetupIntro } from '../ScreenTimeSetupIntro';

describe('ScreenTimeSetupIntro', () => {
  const mockOnEnable = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトルが表示される', () => {
    const { getByText } = render(
      <ScreenTimeSetupIntro onEnable={mockOnEnable} onSkip={mockOnSkip} isLoading={false} />
    );
    expect(getByText('ウェブ保護')).toBeTruthy();
  });

  it('説明文が表示される', () => {
    const { getByText } = render(
      <ScreenTimeSetupIntro onEnable={mockOnEnable} onSkip={mockOnSkip} isLoading={false} />
    );
    expect(getByText(/Screen Timeを使って/)).toBeTruthy();
  });

  it('有効化ボタンタップで onEnable が呼ばれる', () => {
    const { getByText } = render(
      <ScreenTimeSetupIntro onEnable={mockOnEnable} onSkip={mockOnSkip} isLoading={false} />
    );
    fireEvent.press(getByText('スクリーンタイムを有効にする'));
    expect(mockOnEnable).toHaveBeenCalledTimes(1);
  });

  it('スキップボタンタップで onSkip が呼ばれる', () => {
    const { getByText } = render(
      <ScreenTimeSetupIntro onEnable={mockOnEnable} onSkip={mockOnSkip} isLoading={false} />
    );
    fireEvent.press(getByText('あとで設定する'));
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('isLoading=true のときボタンが無効化される', () => {
    const { getByText } = render(
      <ScreenTimeSetupIntro onEnable={mockOnEnable} onSkip={mockOnSkip} isLoading={true} />
    );
    fireEvent.press(getByText('スクリーンタイムを有効にする'));
    expect(mockOnEnable).not.toHaveBeenCalled();
  });
});
