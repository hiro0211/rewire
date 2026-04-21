import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn(), replace: jest.fn() }),
}));

let mockStep: 'idle' | 'requesting' | 'completed' | 'denied' = 'idle';
const mockStartSetup = jest.fn();
jest.mock('@/hooks/screenTime/useScreenTimeSetup', () => ({
  useScreenTimeSetup: () => ({
    step: mockStep,
    isLoading: false,
    startSetup: mockStartSetup,
  }),
}));

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
        'screenTime.completionTitle': '設定完了！',
        'screenTime.completionDescription': '全ブラウザでアダルトサイトが\n自動的にブロックされます',
        'screenTime.deniedTitle': '許可が必要です',
        'screenTime.deniedDescription': '設定アプリから許可してください',
        'common.done': '完了',
      };
      return map[key] ?? key;
    },
  }),
}));

import ScreenTimeSetupScreen from '../screen-time-setup';

describe('ScreenTimeSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStep = 'idle';
  });

  describe('completed ステップ', () => {
    beforeEach(() => {
      mockStep = 'completed';
    });

    it('完了タイトルと説明文が表示される', () => {
      const { getByText } = render(<ScreenTimeSetupScreen />);

      expect(getByText('設定完了！')).toBeTruthy();
      expect(getByText(/全ブラウザでアダルトサイトが/)).toBeTruthy();
    });

    it('クローズボタンをタップすると router.back が呼ばれる', () => {
      const { getByTestId } = render(<ScreenTimeSetupScreen />);

      fireEvent.press(getByTestId('screen-time-setup-close'));

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('denied ステップ', () => {
    beforeEach(() => {
      mockStep = 'denied';
    });

    it('拒否タイトルが表示される', () => {
      const { getByText } = render(<ScreenTimeSetupScreen />);

      expect(getByText('許可が必要です')).toBeTruthy();
    });

    it('クローズボタンをタップすると router.back が呼ばれる', () => {
      const { getByTestId } = render(<ScreenTimeSetupScreen />);

      fireEvent.press(getByTestId('screen-time-setup-close'));

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });
});
