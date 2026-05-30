import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text testID="redirect">{href}</Text>;
  },
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: { background: '#000', primary: '#8B5CF6' },
  }),
}));

let mockHasHydrated = true;
let mockUser: { id: string } | null = { id: 'u' };
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ hasHydrated: mockHasHydrated, user: mockUser }),
}));

const mockSeedDevUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/dev/seedDevUser', () => ({
  seedDevUser: () => mockSeedDevUser(),
}));

import Index from '../index';

describe('Index routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasHydrated = true;
    mockUser = { id: 'u' };
  });

  it('userが既に存在 → /(tabs) にリダイレクト（DEV_SKIP_ONBOARDING=true）', () => {
    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect').props.children).toBe('/(tabs)');
    expect(mockSeedDevUser).not.toHaveBeenCalled();
  });

  it('ハイドレーション未完了時にローディングが表示される', () => {
    mockHasHydrated = false;
    const { getByTestId } = render(<Index />);
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('userがnullのときDEV seedが実行され、その間はローディングを表示する', async () => {
    mockUser = null;
    const { getByTestId } = render(<Index />);
    expect(getByTestId('activity-indicator')).toBeTruthy();
    await waitFor(() => expect(mockSeedDevUser).toHaveBeenCalledTimes(1));
  });
});
