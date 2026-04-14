import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QuickActionRow } from '../QuickActionRow';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#E8E8ED',
      textSecondary: '#6B6B7B',
      surfaceGlass: 'rgba(255,255,255,0.06)',
      borderGlass: 'rgba(255,255,255,0.12)',
    },
    isDark: true,
  }),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'quickAction.breathe': '呼吸',
        'quickAction.checkin': 'チェックイン',
        'quickAction.journal': 'ジャーナル',
        'quickAction.sos': 'SOS',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('QuickActionRow', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('4つのアクションボタンを表示する', () => {
    render(<QuickActionRow />);
    expect(screen.getByText('呼吸')).toBeTruthy();
    expect(screen.getByText('チェックイン')).toBeTruthy();
    expect(screen.getByText('ジャーナル')).toBeTruthy();
    expect(screen.getByText('SOS')).toBeTruthy();
  });

  it('呼吸ボタンタップでbreathingページに遷移する', () => {
    render(<QuickActionRow />);
    fireEvent.press(screen.getByText('呼吸'));
    expect(mockPush).toHaveBeenCalledWith('/breathing');
  });

  it('チェックインボタンタップでcheckinページに遷移する', () => {
    render(<QuickActionRow />);
    fireEvent.press(screen.getByText('チェックイン'));
    expect(mockPush).toHaveBeenCalledWith('/checkin');
  });
});
