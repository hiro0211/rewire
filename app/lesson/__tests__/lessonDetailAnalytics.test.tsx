import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

const mockCompleteLesson = jest.fn().mockResolvedValue(undefined);
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'lesson-1' }),
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('@/stores/learnStore', () => ({
  useLearnStore: () => ({
    completeLesson: mockCompleteLesson,
    isCompleted: () => false,
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { background: '#000', text: '#fff', textSecondary: '#888' },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('@/components/learn/LessonContent', () => ({
  LessonContent: () => null,
}));

jest.mock('@/components/ui/Button', () => {
  const { Text } = require('react-native');
  return { Button: ({ title, onPress }: any) => <Text onPress={onPress}>{title}</Text> };
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

import LessonDetailScreen from '../[id]';

describe('LessonDetailScreen analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('表示時に lesson_started を lesson_id 付きで送信する', () => {
    render(<LessonDetailScreen />);

    expect(mockTrackEvent).toHaveBeenCalledWith('lesson_started', {
      lesson_id: 'lesson-1',
    });
  });

  it('完了ボタン押下時に lesson_completed を送信する', async () => {
    const { getByText } = render(<LessonDetailScreen />);

    fireEvent.press(getByText('learn.lessonComplete'));

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('lesson_completed', {
        lesson_id: 'lesson-1',
      });
    });
  });
});
