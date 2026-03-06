import React from 'react';
import { render } from '@testing-library/react-native';

// --- Mocks ---

// Mock useTheme
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
    gradients: { background: ['#0A0A0F', '#1a1a3e', '#2d1b4e'] },
    glow: {},
    shadows: {},
  }),
}));

// Mock stores
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    loadUser: jest.fn(),
    hasHydrated: true,
    user: null,
  }),
}));
jest.mock('@/stores/themeStore', () => ({
  useThemeStore: Object.assign(jest.fn(() => 'dark'), {
    getState: () => ({ loadThemePreference: jest.fn() }),
  }),
}));

// Mock expo dependencies
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock tracking/subscription
jest.mock('@/lib/tracking/trackingClient', () => ({
  trackingClient: { requestPermissions: jest.fn() },
}));
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { setUserProperty: jest.fn() },
}));
jest.mock('@/lib/tracking/useScreenTracking', () => ({
  useScreenTracking: jest.fn(),
}));
jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: { initialize: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('@/lib/nativeGuard', () => ({
  isExpoGo: true,
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: any) => <View testID="safe-area-provider">{children}</View>,
  };
});

// Track ThemeProvider props
const mockThemeProviderValue = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ThemeProvider: ({ value, children }: any) => {
    mockThemeProviderValue(value);
    const { View } = require('react-native');
    return <View testID="theme-provider">{children}</View>;
  },
  DarkTheme: {
    dark: true,
    colors: {
      primary: '#0A84FF',
      background: '#000000',
      card: '#1C1C1E',
      text: '#FFFFFF',
      border: '#38383A',
      notification: '#FF453A',
    },
  },
  DefaultTheme: {
    dark: false,
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#000000',
      border: '#D8D8D8',
      notification: '#FF3B30',
    },
  },
}));

// Track Stack screenOptions
const mockStackScreenOptions = jest.fn();
jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    Stack: Object.assign(
      ({ screenOptions, children }: any) => {
        mockStackScreenOptions(screenOptions);
        return <View testID="stack">{children}</View>;
      },
      {
        Screen: ({ name }: any) => {
          const { View: V } = require('react-native');
          return <V testID={`screen-${name}`} />;
        },
      },
    ),
  };
});

import RootLayout from '../_layout';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RootLayout テーマ設定', () => {
  test('ThemeProviderでStackを囲んでいる', () => {
    const { getByTestId } = render(<RootLayout />);
    expect(getByTestId('theme-provider')).toBeTruthy();
  });

  test('ThemeProviderのbackgroundがcolors.backgroundに設定されている', () => {
    render(<RootLayout />);
    expect(mockThemeProviderValue).toHaveBeenCalledWith(
      expect.objectContaining({
        colors: expect.objectContaining({
          background: '#0A0A0F',
        }),
      }),
    );
  });

  test('contentStyleのbackgroundColorがcolors.backgroundに設定されている', () => {
    render(<RootLayout />);
    const screenOptions = mockStackScreenOptions.mock.calls[0][0];
    expect(screenOptions.contentStyle.backgroundColor).toBe('#0A0A0F');
  });

  test('contentStyleがtransparentではない', () => {
    render(<RootLayout />);
    const screenOptions = mockStackScreenOptions.mock.calls[0][0];
    expect(screenOptions.contentStyle.backgroundColor).not.toBe('transparent');
  });
});
