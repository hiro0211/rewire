import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#fff', textSecondary: '#999', error: '#EF4444' },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'calendar.weekDays.sun': 'SUN',
        'calendar.weekDays.mon': 'MON',
        'calendar.weekDays.tue': 'TUE',
        'calendar.weekDays.wed': 'WED',
        'calendar.weekDays.thu': 'THU',
        'calendar.weekDays.fri': 'FRI',
        'calendar.weekDays.sat': 'SAT',
      };
      return map[key] ?? key;
    },
  }),
}));

import { CalendarWeekDays } from '../CalendarWeekDays';

describe('CalendarWeekDays', () => {
  it('7曜日を順に表示する', () => {
    const { getByText } = render(<CalendarWeekDays />);
    ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });
});
