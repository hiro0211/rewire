jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'dark'),
}));

import { renderHook } from '@testing-library/react-native';
import { useTheme } from '../useTheme';
import { useThemeStore } from '@/stores/themeStore';
import { DARK_COLORS, LIGHT_COLORS, DARK_GRADIENTS, LIGHT_GRADIENTS, DARK_GLOW, LIGHT_GLOW, DARK_SHADOWS, LIGHT_SHADOWS } from '@/constants/colorPalettes';
import { useColorScheme } from 'react-native';

describe('useTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useThemeStore.setState({ themePreference: 'dark' });
    (useColorScheme as jest.Mock).mockReturnValue('dark');
  });

  it('darkプリファレンスでダークパレットを返す', () => {
    useThemeStore.setState({ themePreference: 'dark' });

    const { result } = renderHook(() => useTheme());

    expect(result.current.colors).toBe(DARK_COLORS);
    expect(result.current.gradients).toBe(DARK_GRADIENTS);
    expect(result.current.glow).toBe(DARK_GLOW);
    expect(result.current.shadows).toBe(DARK_SHADOWS);
    expect(result.current.mode).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('lightプリファレンスでライトパレットを返す', () => {
    useThemeStore.setState({ themePreference: 'light' });

    const { result } = renderHook(() => useTheme());

    expect(result.current.colors).toBe(LIGHT_COLORS);
    expect(result.current.gradients).toBe(LIGHT_GRADIENTS);
    expect(result.current.glow).toBe(LIGHT_GLOW);
    expect(result.current.shadows).toBe(LIGHT_SHADOWS);
    expect(result.current.mode).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('systemプリファレンス + システムdark → ダークパレット', () => {
    useThemeStore.setState({ themePreference: 'system' });
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.colors).toBe(DARK_COLORS);
    expect(result.current.mode).toBe('dark');
  });

  it('systemプリファレンス + システムlight → ライトパレット', () => {
    useThemeStore.setState({ themePreference: 'system' });
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() => useTheme());

    expect(result.current.colors).toBe(LIGHT_COLORS);
    expect(result.current.mode).toBe('light');
  });

  it('systemプリファレンス + システムnull → ダークフォールバック', () => {
    useThemeStore.setState({ themePreference: 'system' });
    (useColorScheme as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useTheme());

    expect(result.current.colors).toBe(DARK_COLORS);
    expect(result.current.mode).toBe('dark');
  });
});
