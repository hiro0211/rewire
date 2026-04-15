import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/components/ui/AuroraBackground', () => {
  const { View } = require('react-native');
  return {
    AuroraBackground: ({ children }: any) => (
      <View testID="aurora-background">{children}</View>
    ),
  };
});

jest.mock('@/components/ui/StarryOverlay', () => {
  const { View } = require('react-native');
  return { StarryOverlay: () => <View testID="starry-overlay" /> };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#fff', textSecondary: '#999', background: '#000' },
    isDark: true,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/stores/learnStore', () => ({
  useLearnStore: () => ({
    completedLessons: [],
    loadProgress: jest.fn(),
    resetProgress: jest.fn(),
    isUnlocked: () => true,
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'Medium' },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34 }),
}));

jest.mock('@/components/learn/LessonProgressBar', () => {
  const { View } = require('react-native');
  return { LessonProgressBar: () => <View testID="lesson-progress" /> };
});

jest.mock('@/components/learn/LessonTimeline', () => {
  const { View } = require('react-native');
  return { LessonTimeline: () => <View testID="lesson-timeline" /> };
});

import LearnScreen from '../learn';

describe('LearnScreen', () => {
  it('AuroraBackgroundでラップされている', () => {
    const { getByTestId } = render(<LearnScreen />);
    expect(getByTestId('aurora-background')).toBeTruthy();
  });

  it('StarryOverlayが表示される', () => {
    const { getByTestId } = render(<LearnScreen />);
    expect(getByTestId('starry-overlay')).toBeTruthy();
  });
});
