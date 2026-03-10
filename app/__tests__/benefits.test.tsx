import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock dependencies
jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({
    nickname: 'テストユーザー',
    goalDays: '30',
    source: 'onboarding',
  }),
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

import BenefitsScreen from '../onboarding/benefits';

describe('BenefitsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<BenefitsScreen />)).not.toThrow();
  });

  it('ニックネームが表示される', () => {
    const { getByText } = render(<BenefitsScreen />);
    expect(getByText(/テストユーザー/)).toBeTruthy();
  });

  it('CTAボタンを押すとペイウォールに遷移する', () => {
    const { getByText } = render(<BenefitsScreen />);
    fireEvent.press(getByText('Rewireを始める'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/paywall',
      params: { source: 'onboarding' },
    });
  });
});
