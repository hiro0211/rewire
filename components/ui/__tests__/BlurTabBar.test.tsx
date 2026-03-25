import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockImpactAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  impactAsync: (...args: any[]) => mockImpactAsync(...args),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (c: any) => c },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    withSpring: (v: any) => v,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name, testID }: any) => <Text testID={testID}>{name}</Text> };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      cyan: '#00D4FF',
      textSecondary: '#6B6B7B',
      border: '#2A2A35',
    },
    glow: {
      cyan: 'rgba(0, 212, 255, 0.2)',
      purple: 'rgba(139, 92, 246, 0.3)',
      danger: 'rgba(239, 68, 68, 0.3)',
    },
    isDark: true,
  }),
}));

import { BlurTabBar } from '../BlurTabBar';

// Helper to create mock BottomTabBarProps
function createMockProps(overrides: Partial<{
  activeIndex: number;
  routeNames: string[];
  labels: string[];
  icons: Record<string, { focused: string; unfocused: string }>;
}> = {}) {
  const {
    activeIndex = 0,
    routeNames = ['index', 'history', 'profile'],
    labels = ['ホーム', '履歴', 'プロフィール'],
  } = overrides;

  const routes = routeNames.map((name, i) => ({
    key: `${name}-key`,
    name,
    params: undefined,
  }));

  const descriptors: Record<string, any> = {};
  routes.forEach((route, i) => {
    descriptors[route.key] = {
      options: {
        tabBarLabel: labels[i],
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const { Text } = require('react-native');
          return <Text testID={`icon-${route.name}`}>{`icon-${route.name}`}</Text>;
        },
        href: undefined,
      },
      navigation: {
        emit: jest.fn(() => ({ defaultPrevented: false })),
        navigate: jest.fn(),
      },
    };
  });

  return {
    state: {
      index: activeIndex,
      routes,
      key: 'tab-state',
      routeNames,
      type: 'tab' as const,
      stale: false as const,
      history: [],
    },
    descriptors,
    navigation: {
      emit: jest.fn(() => ({ defaultPrevented: false })),
      navigate: jest.fn(),
    },
    insets: { top: 0, bottom: 34, left: 0, right: 0 },
  } as any;
}

describe('BlurTabBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('全タブのラベルが表示される', () => {
    const props = createMockProps();
    const { getByText } = render(<BlurTabBar {...props} />);
    expect(getByText('ホーム')).toBeTruthy();
    expect(getByText('履歴')).toBeTruthy();
    expect(getByText('プロフィール')).toBeTruthy();
  });

  it('全タブのアイコンが表示される', () => {
    const props = createMockProps();
    const { getByTestId } = render(<BlurTabBar {...props} />);
    expect(getByTestId('icon-index')).toBeTruthy();
    expect(getByTestId('icon-history')).toBeTruthy();
    expect(getByTestId('icon-profile')).toBeTruthy();
  });

  it('タブタップ時にnavigation.navigateが呼ばれる', () => {
    const props = createMockProps();
    const { getByText } = render(<BlurTabBar {...props} />);
    fireEvent.press(getByText('履歴'));

    expect(props.navigation.navigate).toHaveBeenCalled();
  });

  it('タブタップ時にハプティクス(impactAsync Light)が呼ばれる', () => {
    const props = createMockProps();
    const { getByText } = render(<BlurTabBar {...props} />);
    fireEvent.press(getByText('履歴'));
    expect(mockImpactAsync).toHaveBeenCalledWith('Light');
  });

  it('tabBarIconが未定義のルートは除外される', () => {
    const props = createMockProps({
      routeNames: ['index', 'stats', 'history', 'profile'],
      labels: ['ホーム', '統計', '履歴', 'プロフィール'],
    });
    // Remove tabBarIcon to simulate href: null hidden tab
    props.descriptors['stats-key'].options.tabBarIcon = undefined;

    const { queryByText } = render(<BlurTabBar {...props} />);
    expect(queryByText('統計')).toBeNull();
    expect(queryByText('ホーム')).toBeTruthy();
  });
});
