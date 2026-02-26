import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

const mockSubmit = jest.fn();
jest.mock('@/hooks/checkin/useCheckinSubmit', () => ({
  useCheckinSubmit: () => ({
    submit: mockSubmit,
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/checkin/useCheckinForm', () => ({
  useCheckinForm: () => ({
    formState: {
      watchedPorn: false,
      urgeLevel: 2,
      stressLevel: 1,
      qualityOfLife: 3,
      memo: '',
    },
    setField: jest.fn(),
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { __esModule: true, default: (props: any) => <View {...props} /> };
});

import CheckinScreen from '../index';

describe('CheckinScreen analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmit.mockResolvedValue({ success: true });
  });

  it('チェックイン送信時に checkin_submitted イベントが送信される', async () => {
    const { getByText } = render(<CheckinScreen />);
    fireEvent.press(getByText('記録する'));

    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('checkin_submitted', {
        watched_porn: false,
        urge_level: 2,
        stress_level: 1,
      });
    });
  });
});
