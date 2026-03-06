export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceHighlight: string;
  text: string;
  textSecondary: string;
  primary: string;
  success: string;
  warning: string;
  pro: string;
  danger: string;
  error: string;
  border: string;
  overlay: string;
  overlayLight: string;
  backgroundDeepNavy: string;
  backgroundNavy: string;
  cyan: string;
  pillBorder: string;
  pillBackground: string;
  selectedPillBorder: string;
  contrastText: string;
}

export interface GradientPalette {
  background: readonly string[];
  card: readonly string[];
  hero: readonly string[];
  button: readonly string[];
  danger: readonly string[];
  accent: readonly string[];
}

export interface GlowPalette {
  purple: string;
  cyan: string;
  danger: string;
}

export interface ShadowDef {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ShadowPalette {
  small: ShadowDef;
  medium: ShadowDef;
}

export interface ThemeColors {
  colors: ColorPalette;
  gradients: GradientPalette;
  glow: GlowPalette;
  shadows: ShadowPalette;
  mode: ResolvedTheme;
  isDark: boolean;
}
