import React from 'react';
import { render } from '@testing-library/react-native';
import Index from '../index';

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

// 本番設定を検証するテストなのでデバッグメニューは無効固定。
// （constants/debug.ts の DEBUG_MENU_ENABLED はローカル確認で true にすることがある）
jest.mock('@/constants/debug', () => ({
  DEBUG_MENU_ENABLED: false,
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

// 本番運用設定（DEV_SKIP_ONBOARDING=false）の挙動を検証する。
// ブランド画面へ遷移し、ブランド画面側で /(tabs) か /onboarding を振り分ける。
describe('Index routing（本番設定）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasHydrated = true;
    mockUser = { id: 'u' };
  });

  it('userが存在 → /brand にリダイレクトし、DEV seedは実行されない', () => {
    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect').props.children).toBe('/brand');
    expect(mockSeedDevUser).not.toHaveBeenCalled();
  });

  it('userがnullでも /brand にリダイレクトし、DEV seedは実行されない', () => {
    mockUser = null;
    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect').props.children).toBe('/brand');
    expect(mockSeedDevUser).not.toHaveBeenCalled();
  });

  it('ハイドレーション未完了時にローディングが表示される', () => {
    mockHasHydrated = false;
    const { getByTestId } = render(<Index />);
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });
});
