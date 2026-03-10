import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { InteractionManager } from 'react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  useLocalSearchParams: () => ({
    nickname: 'TestUser',
    consentGivenAt: '2026-02-25T00:00:00Z',
    notifyTime: '22:00',
  }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    setUser: jest.fn(),
  }),
}));

jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    scheduleDailyReminder: jest.fn(),
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

describe('GoalSettingScreen', () => {
  it('testID="starry-background" が存在する', () => {
    const { getByTestId } = render(<GoalSettingScreen />);
    expect(getByTestId('starry-background')).toBeTruthy();
  });

  it('ゴール日数の選択肢が表示される', () => {
    const { getByTestId } = render(<GoalSettingScreen />);
    expect(getByTestId('picker')).toBeTruthy();
  });

  it('"開始する" ボタンが表示される', () => {
    const { getByText } = render(<GoalSettingScreen />);
    expect(getByText('開始する')).toBeTruthy();
  });

  it('handleFinish で InteractionManager.runAfterInteractions を経由して router.replace が呼ばれる', async () => {
    const runAfterSpy = jest.spyOn(InteractionManager, 'runAfterInteractions');

    const { getByText } = render(<GoalSettingScreen />);
    fireEvent.press(getByText('開始する'));

    await waitFor(() => {
      expect(runAfterSpy).toHaveBeenCalledTimes(1);
    });

    // runAfterInteractions に渡されたコールバックを実行
    const callback = runAfterSpy.mock.calls[0][0] as () => void;
    callback();

    expect(mockReplace).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/onboarding/benefits',
      })
    );

    runAfterSpy.mockRestore();
  });
});
