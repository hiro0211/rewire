import React from 'react';
import { render } from '@testing-library/react-native';

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

let mockUser: { id: string } | null = { id: 'u' };
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ hasHydrated: true, user: mockUser }),
}));

// デバッグプレビューを有効化した状態
jest.mock('@/hooks/debug/useDebugUnlockAll', () => ({
  useDebugUnlockAll: () => true,
}));

jest.mock('@/stores/debugStore', () => ({
  useDebugStore: (selector: (s: { hasHydrated: boolean; enabled: boolean }) => unknown) =>
    selector({ hasHydrated: true, enabled: true }),
}));

const mockSeedDevUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/dev/seedDevUser', () => ({
  seedDevUser: () => mockSeedDevUser(),
}));

import Index from '../index';

describe('Index routing（デバッグ有効）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 'u' };
  });

  it('デバッグ有効 + user 存在 → /(tabs) にリダイレクトする', () => {
    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect').props.children).toBe('/(tabs)');
  });

  it('デバッグ有効 + user null → dev user を seed する（オンボーディングをスキップ）', () => {
    mockUser = null;
    render(<Index />);
    expect(mockSeedDevUser).toHaveBeenCalledTimes(1);
  });
});
