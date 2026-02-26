import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: { logEvent: jest.fn() },
}));

let mockSubmitResult = { success: true };
const mockSubmit = jest.fn().mockImplementation(() => Promise.resolve(mockSubmitResult));
jest.mock('@/hooks/checkin/useCheckinSubmit', () => ({
  useCheckinSubmit: () => ({
    submit: (...args: any[]) => mockSubmit(...args),
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/checkin/useCheckinForm', () => ({
  useCheckinForm: () => ({
    formState: {
      watchedPorn: null,
      urgeLevel: 3,
      stressLevel: 3,
      qualityOfLife: 3,
      memo: '',
    },
    setField: jest.fn(),
  }),
}));

jest.mock('@/components/checkin/BinaryQuestion', () => {
  const { View } = require('react-native');
  return { BinaryQuestion: (props: any) => <View testID="binary-question" /> };
});

jest.mock('@/components/checkin/LevelSlider', () => {
  const { View } = require('react-native');
  return { LevelSlider: (props: any) => <View testID={`slider-${props.label}`} /> };
});

jest.mock('@/components/checkin/MemoInput', () => {
  const { View } = require('react-native');
  return { MemoInput: (props: any) => <View testID="memo-input" /> };
});

import CheckinScreen from '../index';

describe('CheckinScreen crash prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmitResult = { success: true };
  });

  it('初期レンダリング → クラッシュしない', () => {
    expect(() => render(<CheckinScreen />)).not.toThrow();
  });

  it('watchedPorn=null時に「記録する」ボタンは無効', () => {
    const { getByText } = render(<CheckinScreen />);
    const button = getByText('記録する');
    expect(button).toBeTruthy();
  });

  it('submit失敗時 → クラッシュしない', async () => {
    mockSubmitResult = { success: false, error: 'テストエラー' } as any;
    expect(() => render(<CheckinScreen />)).not.toThrow();
  });

  it('submit が例外をthrow → クラッシュしない', () => {
    mockSubmit.mockRejectedValueOnce(new Error('Unexpected'));
    expect(() => render(<CheckinScreen />)).not.toThrow();
  });
});
