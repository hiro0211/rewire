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

let mockHasHydrated = true;
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ hasHydrated: mockHasHydrated }),
}));

import Index from '../index';

describe('Index routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasHydrated = true;
  });

  it('/brandにリダイレクトする', () => {
    const { getByTestId } = render(<Index />);
    expect(getByTestId('redirect').props.children).toBe('/brand');
  });

  it('ハイドレーション未完了時にローディングが表示される', () => {
    mockHasHydrated = false;
    const { getByTestId } = render(<Index />);
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });
});
