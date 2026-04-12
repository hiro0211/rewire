import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

// Mock Reanimated hooks
jest.mock('react-native-reanimated', () => ({
  useSharedValue: (v: any) => ({ value: v }),
  useDerivedValue: (fn: any) => ({ value: fn() }),
  useFrameCallback: () => {},
}));

// Simulate Expo Go — Skia should be skipped entirely
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'storeClient' },
}));

import { AuroraBackground } from '../AuroraBackground';

describe('AuroraBackground — Expo Go（Skia 利用不可）', () => {
  it('フォールバック背景が表示される', () => {
    const { getByTestId } = render(<AuroraBackground />);
    expect(getByTestId('aurora-fallback')).toBeTruthy();
  });

  it('Expo Go でも children が表示される', () => {
    const { getByText } = render(
      <AuroraBackground>
        <Text>フォールバックテスト</Text>
      </AuroraBackground>,
    );
    expect(getByText('フォールバックテスト')).toBeTruthy();
  });
});
