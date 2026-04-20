import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QuickActionGrid } from '../QuickActionGrid';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockOpenReflection = jest.fn();
jest.mock('@/hooks/reflection/useReflectionSheet', () => ({
  useReflectionSheet: (selector: any) => selector({ open: mockOpenReflection }),
}));

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

describe('QuickActionGrid', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockOpenReflection.mockClear();
  });

  it('3ボタンがレンダリングされる', () => {
    render(<QuickActionGrid />);
    expect(screen.getByTestId('quick-action-grid')).toBeTruthy();
    expect(screen.getByText('呼吸')).toBeTruthy();
    expect(screen.getByText('振り返り')).toBeTruthy();
    expect(screen.getByText('カレンダー')).toBeTruthy();
  });

  it('呼吸ボタンタップで /breathing に遷移する', () => {
    render(<QuickActionGrid />);
    fireEvent.press(screen.getByTestId('qa-breathe'));
    expect(mockPush).toHaveBeenCalledWith('/breathing');
  });

  it('振り返りボタンタップで ReflectionSheet を開く', () => {
    render(<QuickActionGrid />);
    fireEvent.press(screen.getByTestId('qa-checkin'));
    expect(mockOpenReflection).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalledWith('/checkin');
  });

  it('カレンダーボタンタップで /history に遷移する', () => {
    render(<QuickActionGrid />);
    fireEvent.press(screen.getByTestId('qa-calendar'));
    expect(mockPush).toHaveBeenCalledWith('/history');
  });
});
