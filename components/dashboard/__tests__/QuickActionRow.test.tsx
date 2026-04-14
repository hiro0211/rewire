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
        'quickAction.checkin': '振り返り',
        'quickAction.calendar': 'カレンダー',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('QuickActionRow', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('3つのアクションボタンを表示する', () => {
    render(<QuickActionRow />);
    expect(screen.getByText('呼吸')).toBeTruthy();
    expect(screen.getByText('振り返り')).toBeTruthy();
    expect(screen.getByText('カレンダー')).toBeTruthy();
  });

  it('ジャーナルとSOSボタンは表示しない', () => {
    render(<QuickActionRow />);
    expect(screen.queryByTestId('qa-journal')).toBeNull();
    expect(screen.queryByTestId('qa-sos')).toBeNull();
  });

  it('呼吸ボタンタップでbreathingページに遷移する', () => {
    render(<QuickActionRow />);
    fireEvent.press(screen.getByTestId('qa-breathe'));
    expect(mockPush).toHaveBeenCalledWith('/breathing');
  });

  it('振り返りボタンタップでcheckinページに遷移する', () => {
    render(<QuickActionRow />);
    fireEvent.press(screen.getByTestId('qa-checkin'));
    expect(mockPush).toHaveBeenCalledWith('/checkin');
  });

  it('カレンダーボタンタップでstreak-calendarページに遷移する', () => {
    render(<QuickActionRow />);
    fireEvent.press(screen.getByTestId('qa-calendar'));
    expect(mockPush).toHaveBeenCalledWith('/streak-calendar');
  });
});
