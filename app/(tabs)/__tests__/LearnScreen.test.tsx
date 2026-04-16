import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/components/common/SafeAreaWrapper', () => {
  const { View } = require('react-native');
  return {
    SafeAreaWrapper: ({ children }: any) => (
      <View testID="safe-area-wrapper">{children}</View>
    ),
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { text: '#fff', textSecondary: '#999', background: '#000' },
    gradients: { background: ['#0A0A0F', '#1a1a3e', '#2d1b4e'] },
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
  it('SafeAreaWrapperでラップされている', () => {
    const { getByTestId } = render(<LearnScreen />);
    expect(getByTestId('safe-area-wrapper')).toBeTruthy();
  });

  it('AuroraBackground / StarryOverlay は使用されない', () => {
    const { queryByTestId } = render(<LearnScreen />);
    expect(queryByTestId('aurora-background')).toBeNull();
    expect(queryByTestId('aurora-container')).toBeNull();
    expect(queryByTestId('starry-overlay')).toBeNull();
  });
});
