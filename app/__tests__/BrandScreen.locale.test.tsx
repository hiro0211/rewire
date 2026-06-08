import React from 'react';
import { render } from '@testing-library/react-native';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/components/onboarding/StarryBackground', () => {
  const { View } = require('react-native');
  return {
    StarryBackground: ({ children }: any) => (
      <View testID="starry-container">{children}</View>
    ),
  };
});

jest.mock('@/components/ui/ShootingStars', () => {
  const { View } = require('react-native');
  return {
    ShootingStars: () => <View testID="shooting-stars-mock" />,
  };
});

jest.mock('@/stores/userStore', () => ({
  useUserStore: Object.assign(
    () => ({ user: null }),
    { getState: () => ({ user: null }) },
  ),
}));

let mockHasHydrated = false;
let mockLocalePreference: 'system' | 'en' | 'ja' = 'system';
const localeSnapshot = () => ({
  hasHydrated: mockHasHydrated,
  localePreference: mockLocalePreference,
});

jest.mock('@/stores/localeStore', () => ({
  useLocaleStore: Object.assign(
    (selector?: (s: ReturnType<typeof localeSnapshot>) => unknown) =>
      selector ? selector(localeSnapshot()) : localeSnapshot(),
    {
      getState: () => ({
        ...localeSnapshot(),
        loadLocalePreference: jest.fn(),
      }),
    },
  ),
}));

import { BrandScreen } from '../brand';
import { i18n } from '@/locales/i18n';

const ENGLISH_LINE_2 = 'A new you starts now.';

const flattenStyle = (style: unknown): Record<string, unknown> => {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flattenStyle));
  }
  return (style as Record<string, unknown>) ?? {};
};

describe('BrandScreen locale ハイドレーション安全性 (regression)', () => {
  let originalLocale: string;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockHasHydrated = false;
    mockLocalePreference = 'system';
    originalLocale = i18n.locale;
    i18n.locale = 'ja';
  });

  afterEach(() => {
    jest.useRealTimers();
    i18n.locale = originalLocale;
  });

  it('locale が ja→en に切り替わった後でも、英語2行目の全文字が初期 opacity 0 を保つ（"now." 早期表示バグ回帰防止）', () => {
    // 1回目レンダー: ハイドレーション未完了 + i18n は ja
    const { rerender, queryByTestId, getByTestId } = render(<BrandScreen />);

    // ハイドレーション完了 + 英語 preference へ
    mockHasHydrated = true;
    mockLocalePreference = 'en';
    i18n.locale = 'en';
    rerender(<BrandScreen />);

    const line = getByTestId('catchphrase-line-1');
    expect(line).toBeTruthy();

    const children = React.Children.toArray(line.props.children) as Array<{
      props: { style: unknown };
    }>;
    expect(children).toHaveLength(ENGLISH_LINE_2.length);

    children.forEach((child, idx) => {
      const flat = flattenStyle(child.props.style);
      // バグでは charOpacities が日本語サイズで止まり、index >= 16 の opacity が undefined になる
      expect(flat.opacity).toBeDefined();
      const opacity = flat.opacity as { _value?: number } | undefined;
      expect(opacity).toBeTruthy();
      // 初期値は 0（未アニメーション）でなくてはならない
      expect(opacity?._value).toBe(0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      void idx;
    });

    // 念のため: starry-container は常に存在し、locale 確定後にキャッチフレーズが mount される
    expect(queryByTestId('starry-container')).toBeTruthy();
  });
});
