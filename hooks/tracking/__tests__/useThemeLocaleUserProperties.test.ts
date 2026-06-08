import { renderHook } from '@testing-library/react-native';

const mockSetUserProperty = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    setUserProperty: (...args: any[]) => mockSetUserProperty(...args),
  },
}));

let mockTheme = 'dark';
let mockLocale = 'system';
jest.mock('@/stores/themeStore', () => ({
  useThemeStore: (selector: any) => selector({ themePreference: mockTheme }),
}));
jest.mock('@/stores/localeStore', () => ({
  useLocaleStore: (selector: any) => selector({ localePreference: mockLocale }),
}));

import { useThemeLocaleUserProperties } from '../useThemeLocaleUserProperties';

describe('useThemeLocaleUserProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme = 'dark';
    mockLocale = 'system';
  });

  it('初回に theme_preference / locale_preference を設定する', () => {
    renderHook(() => useThemeLocaleUserProperties());

    expect(mockSetUserProperty).toHaveBeenCalledWith('theme_preference', 'dark');
    expect(mockSetUserProperty).toHaveBeenCalledWith('locale_preference', 'system');
  });

  it('テーマ変更時に theme_preference を再設定する', () => {
    const { rerender } = renderHook(() => useThemeLocaleUserProperties());
    mockSetUserProperty.mockClear();

    mockTheme = 'light';
    rerender({});

    expect(mockSetUserProperty).toHaveBeenCalledWith('theme_preference', 'light');
  });
});
