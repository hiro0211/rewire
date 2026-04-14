import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  Stack: { Screen: (props: any) => null },
}));

const mockLoadCheckins = jest.fn();
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: (selector?: any) => {
    const state = { loadCheckins: mockLoadCheckins, checkins: [] };
    return selector ? selector(state) : state;
  },
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#000',
      text: '#fff',
      textSecondary: '#999',
      surface: '#111',
      surfaceHighlight: '#222',
    },
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'nav.recordHistory': 'Record History',
        'common.back': 'Back',
        'historyView.calendar': 'Calendar',
        'historyView.list': 'List',
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock('@/components/ui/GradientCard', () => {
  const { View } = require('react-native');
  return { GradientCard: ({ children, ...props }: any) => <View {...props}>{children}</View> };
});

jest.mock('@/components/ui/SegmentedControl', () => {
  const { View, Text, Pressable } = require('react-native');
  return {
    SegmentedControl: ({ segments, selectedIndex, onChange }: any) => (
      <View testID="segmented-control">
        {segments.map((s: string, i: number) => (
          <Pressable key={s} testID={`segment-${i}`} onPress={() => onChange(i)}>
            <Text>{s}</Text>
          </Pressable>
        ))}
      </View>
    ),
  };
});

jest.mock('@/components/history/HistoryCalendar', () => {
  const { View } = require('react-native');
  return { HistoryCalendar: () => <View testID="history-calendar" /> };
});

jest.mock('@/components/history/HistoryList', () => {
  const { View } = require('react-native');
  return { HistoryList: () => <View testID="history-list" /> };
});

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

import HistoryScreen from '../index';

describe('HistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SegmentedControlが表示される', () => {
    const { getByTestId } = render(<HistoryScreen />);
    expect(getByTestId('segmented-control')).toBeTruthy();
  });

  it('初期状態でカレンダービューが表示される', () => {
    const { getByTestId, queryByTestId } = render(<HistoryScreen />);
    expect(getByTestId('history-calendar')).toBeTruthy();
    expect(queryByTestId('history-list')).toBeNull();
  });

  it('リストセグメントをタップするとリストビューに切り替わる', () => {
    const { getByTestId, queryByTestId } = render(<HistoryScreen />);

    fireEvent.press(getByTestId('segment-1'));

    expect(queryByTestId('history-calendar')).toBeNull();
    expect(getByTestId('history-list')).toBeTruthy();
  });

  it('リストからカレンダーに戻せる', () => {
    const { getByTestId, queryByTestId } = render(<HistoryScreen />);

    fireEvent.press(getByTestId('segment-1'));
    fireEvent.press(getByTestId('segment-0'));

    expect(getByTestId('history-calendar')).toBeTruthy();
    expect(queryByTestId('history-list')).toBeNull();
  });

  it('マウント時にloadCheckinsが呼ばれる', () => {
    render(<HistoryScreen />);
    expect(mockLoadCheckins).toHaveBeenCalled();
  });
});
