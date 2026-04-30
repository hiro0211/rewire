import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      streakActive: '#8B5CF6',
      error: '#EF4444',
      borderGlass: 'rgba(255,255,255,0.22)',
      textSecondary: '#9CA0B5',
    },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'calendar.clean': 'Clean',
        'calendar.relapse': 'Relapse',
        'calendar.noData': 'No Data',
      };
      return map[key] ?? key;
    },
  }),
}));

import { CalendarLegend } from '../CalendarLegend';

describe('CalendarLegend', () => {
  it('Clean / Relapse / No Data の3項目を表示する', () => {
    const { getByText } = render(<CalendarLegend />);
    expect(getByText('Clean')).toBeTruthy();
    expect(getByText('Relapse')).toBeTruthy();
    expect(getByText('No Data')).toBeTruthy();
  });
});
