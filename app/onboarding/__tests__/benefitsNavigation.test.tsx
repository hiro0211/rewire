import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { InteractionManager } from 'react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({
    nickname: 'TestUser',
    goalDays: '30',
    source: 'onboarding',
  }),
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

jest.mock('@/components/paywall/PrePaywallBenefits', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return {
    PrePaywallBenefits: ({ onContinue }: { onContinue: () => void }) => (
      <TouchableOpacity testID="continue-btn" onPress={onContinue}>
        <Text>Continue</Text>
      </TouchableOpacity>
    ),
  };
});

import BenefitsScreen from '../benefits';

describe('BenefitsScreen navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('InteractionManager.runAfterInteractions でラップしてから router.replace を呼ぶ', () => {
    const runAfterSpy = jest.spyOn(InteractionManager, 'runAfterInteractions');

    const { getByTestId } = render(<BenefitsScreen />);
    fireEvent.press(getByTestId('continue-btn'));

    expect(runAfterSpy).toHaveBeenCalledTimes(1);

    // コールバックを実行して router.replace が正しく呼ばれることを確認
    const callback = runAfterSpy.mock.calls[0][0] as () => void;
    callback();

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/paywall',
      params: { source: 'onboarding' },
    });

    runAfterSpy.mockRestore();
  });
});
