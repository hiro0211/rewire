import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockSubmit = jest.fn();
jest.mock('@/hooks/checkin/useCheckinSubmit', () => ({
  useCheckinSubmit: () => ({
    submit: mockSubmit,
    isLoading: false,
    error: null,
  }),
}));

let mockFormState = {
  watchedPorn: false as boolean | null,
  urgeLevel: 2,
  stressLevel: 1,
  qualityOfLife: 3,
  memo: '',
};

jest.mock('@/hooks/checkin/useCheckinForm', () => ({
  useCheckinForm: () => ({
    formState: mockFormState,
    setField: jest.fn(),
  }),
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

import CheckinScreen from '../index';

describe('CheckinScreen ルーティング分岐', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmit.mockResolvedValue({ success: true });
  });

  it('watchedPorn=false で送信成功 → /streak に遷移する', async () => {
    mockFormState = { watchedPorn: false, urgeLevel: 2, stressLevel: 1, qualityOfLife: 3, memo: '' };
    const { getByText } = render(<CheckinScreen />);
    fireEvent.press(getByText('記録する'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/streak');
    });
  });

  it('watchedPorn=true で送信成功 → /recovery に遷移する', async () => {
    mockFormState = { watchedPorn: true, urgeLevel: 2, stressLevel: 1, qualityOfLife: 3, memo: '' };
    const { getByText } = render(<CheckinScreen />);
    fireEvent.press(getByText('記録する'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/recovery');
    });
  });
});
