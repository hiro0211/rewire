import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockReplace = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}));

const mockSetUser = jest.fn();
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    setUser: (...args: any[]) => mockSetUser(...args),
  }),
}));

jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    scheduleDailyReminder: jest.fn(),
  },
}));

const mockSubmitOnboardingSurvey = jest.fn();
jest.mock('@/features/survey/surveyService', () => ({
  surveyService: {
    submitOnboardingSurvey: (...args: any[]) => mockSubmitOnboardingSurvey(...args),
  },
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid',
}));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Picker = ({ children }: any) => <View testID="picker">{children}</View>;
  Picker.Item = ({ label }: any) => <Text>{label}</Text>;
  return { Picker };
});

import GoalSettingScreen from '../goal';

const BASE_PARAMS = {
  nickname: 'TestUser',
  consentGivenAt: '2026-02-25T00:00:00Z',
  notifyTime: '22:00',
};

const SURVEY_ANSWERS = {
  age_range: '25-34',
  discovery_channel: 'tiktok',
  motivation: 'self_control',
};

describe('オンボーディング調査の送信（オンボーディング完了時）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmitOnboardingSurvey.mockResolvedValue(undefined);
    mockParams = { ...BASE_PARAMS };
  });

  it('回答があれば完了時に1回だけ送信する', async () => {
    mockParams = { ...BASE_PARAMS, surveyAnswers: JSON.stringify(SURVEY_ANSWERS) };

    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockSubmitOnboardingSurvey).toHaveBeenCalledTimes(1);
    });
    expect(mockSubmitOnboardingSurvey).toHaveBeenCalledWith(SURVEY_ANSWERS);
  });

  it('ユーザー作成後に送信する（userId を残すため）', async () => {
    mockParams = { ...BASE_PARAMS, surveyAnswers: JSON.stringify(SURVEY_ANSWERS) };

    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockSubmitOnboardingSurvey).toHaveBeenCalled();
    });
    expect(mockSetUser.mock.invocationCallOrder[0]).toBeLessThan(
      mockSubmitOnboardingSurvey.mock.invocationCallOrder[0]
    );
  });

  it('スキップされた（パラメータ無し）場合は送信しない', async () => {
    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();
    });
    expect(mockSubmitOnboardingSurvey).not.toHaveBeenCalled();
  });

  it('空の回答オブジェクトでは送信しない', async () => {
    mockParams = { ...BASE_PARAMS, surveyAnswers: JSON.stringify({}) };

    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();
    });
    expect(mockSubmitOnboardingSurvey).not.toHaveBeenCalled();
  });

  it('送信が失敗してもオンボーディングの完了を妨げない', async () => {
    mockParams = { ...BASE_PARAMS, surveyAnswers: JSON.stringify(SURVEY_ANSWERS) };
    mockSubmitOnboardingSurvey.mockRejectedValue(new Error('firestore down'));

    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockSubmitOnboardingSurvey).toHaveBeenCalled();
    });
    // 完了処理（router.replace への遷移予約）まで到達している
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/onboarding/benefits' })
      );
    });
  });

  it('壊れた JSON が渡ってもクラッシュせず完了できる', async () => {
    mockParams = { ...BASE_PARAMS, surveyAnswers: '{not json' };

    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();
    });
    expect(mockSubmitOnboardingSurvey).not.toHaveBeenCalled();
  });
});
