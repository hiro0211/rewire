import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    useAnimatedProps: () => ({}),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    withRepeat: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { out: (f: any) => f, quad: (v: number) => v },
    FadeIn: { duration: () => ({ duration: jest.fn().mockReturnThis() }) },
    SlideInUp: {
      springify: () => ({
        damping: () => ({
          stiffness: jest.fn().mockReturnThis(),
        }),
      }),
    },
  };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Polyline: () => <View />,
    Circle: () => <View />,
    Path: () => <View />,
    Line: () => <View />,
  };
});

// Mock Sparkline to avoid SVG + reanimated Easing complexity
jest.mock('@/components/ui/Sparkline', () => ({
  Sparkline: () => {
    const { View } = require('react-native');
    return <View testID="sparkline-mock" />;
  },
}));

const mockUpdateUser = jest.fn();

jest.mock('@/hooks/dashboard/useDashboardStats', () => ({
  useDashboardStats: () => ({
    relapseCount: 2,
    stopwatch: { days: 2, hours: 15, minutes: 31, formatted: '2日15時間31分' },
    goalDays: 90,
    streakStartDate: '2026-02-24T19:00:00Z',
  }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    updateUser: mockUpdateUser,
  }),
}));

jest.mock('@/hooks/dashboard/useCheckinTrends', () => ({
  useCheckinTrends: () => ({
    urgeLevel: [0, 1, 2, 1, 3, 2, 1],
    stressLevel: [1, 0, 1, 2, 1, 0, 1],
    qualityOfLife: [3, 4, 3, 5, 4, 3, 4],
  }),
}));

jest.mock('@/hooks/dashboard/useDashboardStats', () => ({
  useDashboardStats: () => ({
    relapseCount: 2,
    stopwatch: { days: 2, hours: 15, minutes: 31, formatted: '2日15時間31分' },
    goalDays: 90,
    streakStartDate: '2026-02-24T19:00:00Z',
  }),
}));

jest.mock('../StatsDetailModal', () => ({
  StatsDetailModal: ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    const { View, Text, TouchableOpacity } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="stats-detail-modal">
        <Text>統計詳細モーダル</Text>
        <TouchableOpacity testID="close-detail-modal" onPress={onClose}>
          <Text>閉じる</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

import { StatsRow } from '../StatsRow';

describe('StatsRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ヒーローカードとインライン統計が表示される', () => {
    const { getByTestId } = render(<StatsRow onShare={jest.fn()} />);
    expect(getByTestId('stat-stopwatch')).toBeTruthy();
    expect(getByTestId('stat-relapse')).toBeTruthy();
    expect(getByTestId('stat-goal')).toBeTruthy();
  });

  it('ヒーローカードに現在の記録とストップウォッチが表示される', () => {
    const { getByText } = render(<StatsRow onShare={jest.fn()} />);
    expect(getByText('現在の記録')).toBeTruthy();
    expect(getByText('2日15時間31分')).toBeTruthy();
  });

  it('ヒーローカードに開始日が表示される', () => {
    const { getByText } = render(<StatsRow onShare={jest.fn()} />);
    expect(getByText(/から$/)).toBeTruthy();
  });

  it('リセット回数が表示される', () => {
    const { getByText } = render(<StatsRow onShare={jest.fn()} />);
    expect(getByText('リセット回数')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('目標日数が表示される', () => {
    const { getByText } = render(<StatsRow onShare={jest.fn()} />);
    expect(getByText('目標日数')).toBeTruthy();
    expect(getByText('90日')).toBeTruthy();
  });

  it('GlowDivider が表示される', () => {
    const { getByTestId } = render(<StatsRow onShare={jest.fn()} />);
    expect(getByTestId('glow-divider')).toBeTruthy();
  });

  it('ヒーローカードタップで StatsDetailModal が表示される', () => {
    const { getByTestId, getByText } = render(<StatsRow onShare={jest.fn()} />);
    fireEvent.press(getByTestId('hero-card-touch'));
    expect(getByText('統計詳細モーダル')).toBeTruthy();
  });

  it('ヒーローカード長押しでStreakEditModalが表示される', () => {
    const { getByTestId, getByText } = render(<StatsRow onShare={jest.fn()} />);
    fireEvent(getByTestId('hero-card-touch'), 'onLongPress');
    expect(getByText('開始日を編集')).toBeTruthy();
  });

  it('シェアボタンが表示される', () => {
    const { getByTestId, getByText } = render(<StatsRow onShare={jest.fn()} />);
    expect(getByTestId('share-button')).toBeTruthy();
    expect(getByText('シェア')).toBeTruthy();
  });

  it('シェアボタンタップで onShare が呼ばれる', () => {
    const mockOnShare = jest.fn();
    const { getByTestId } = render(<StatsRow onShare={mockOnShare} />);
    fireEvent.press(getByTestId('share-button'));
    expect(mockOnShare).toHaveBeenCalledTimes(1);
  });

  it('ViewShotComponent を渡すとキャプチャラッパーが表示される', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockViewShot = React.forwardRef((props: any, ref: any) =>
      React.createElement(View, { ...props, testID: 'viewshot-wrapper' })
    );
    const ref = React.createRef();

    const { getByTestId } = render(
      <StatsRow
        onShare={jest.fn()}
        viewShotRef={ref}
        ViewShotComponent={MockViewShot}
      />
    );
    expect(getByTestId('viewshot-wrapper')).toBeTruthy();
  });

  it('ViewShotComponent なしでもクラッシュしない', () => {
    expect(() =>
      render(<StatsRow onShare={jest.fn()} />)
    ).not.toThrow();
  });
});
