import React from 'react';
import { render } from '@testing-library/react-native';

// --- Mocks ---

const mockColors = {
  background: '#0A0A0F',
  text: '#FFFFFF',
  primary: '#8B5CF6',
  cyan: '#06B6D4',
};
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: mockColors,
    isDark: true,
    mode: 'dark',
    gradients: {},
    glow: {},
    shadows: {},
  }),
}));

// Track Tabs props
const mockTabsScreenOptions = jest.fn();
jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    Tabs: Object.assign(
      ({ screenOptions, children }: any) => {
        mockTabsScreenOptions(screenOptions);
        return <View testID="tabs">{children}</View>;
      },
      {
        Screen: ({ name }: any) => {
          const { View: V } = require('react-native');
          return <V testID={`tab-${name}`} />;
        },
      },
    ),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@/components/ui/BlurTabBar', () => ({
  BlurTabBar: () => null,
}));

import TabLayout from '../(tabs)/_layout';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TabLayout テーマ設定', () => {
  test('headerStyleのbackgroundColorがcolors.backgroundに設定されている', () => {
    render(<TabLayout />);
    const screenOptions = mockTabsScreenOptions.mock.calls[0][0];
    expect(screenOptions.headerStyle.backgroundColor).toBe('#0A0A0F');
  });

  test('headerStyleのbackgroundColorがtransparentではない', () => {
    render(<TabLayout />);
    const screenOptions = mockTabsScreenOptions.mock.calls[0][0];
    expect(screenOptions.headerStyle.backgroundColor).not.toBe('transparent');
  });
});
