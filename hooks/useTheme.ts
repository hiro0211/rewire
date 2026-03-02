import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/stores/themeStore';
import {
  DARK_COLORS, LIGHT_COLORS,
  DARK_GRADIENTS, LIGHT_GRADIENTS,
  DARK_GLOW, LIGHT_GLOW,
  DARK_SHADOWS, LIGHT_SHADOWS,
} from '@/constants/colorPalettes';
import type { ThemeColors, ResolvedTheme } from '@/types/theme';

export function useTheme(): ThemeColors {
  const preference = useThemeStore((s) => s.themePreference);
  const systemScheme = useColorScheme();

  const mode: ResolvedTheme =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;
  const isDark = mode === 'dark';

  return {
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    gradients: isDark ? DARK_GRADIENTS : LIGHT_GRADIENTS,
    glow: isDark ? DARK_GLOW : LIGHT_GLOW,
    shadows: isDark ? DARK_SHADOWS : LIGHT_SHADOWS,
    mode,
    isDark,
  };
}
