import type { ColorPalette, GradientPalette, GlowPalette, ShadowPalette } from '@/types/theme';

// Dark palette — identical to existing COLORS + contrastText
export const DARK_COLORS: ColorPalette = {
  background: '#0A0A0F',
  surface: '#16161E',
  surfaceHighlight: '#1F1F2C',
  text: '#E8E8ED',
  textSecondary: '#6B6B7B',
  primary: '#4A90D9',
  success: '#3DD68C',
  warning: '#F0A030',
  pro: '#C8A84E',
  danger: '#EF4444',
  error: '#EF4444',
  border: '#2A2A35',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  backgroundDeepNavy: '#0B1026',
  backgroundNavy: '#0D1B2A',
  cyan: '#00D4FF',
  pillBorder: 'rgba(255, 255, 255, 0.12)',
  pillBackground: 'rgba(255, 255, 255, 0.05)',
  selectedPillBorder: '#00B4D8',
  contrastText: '#FFFFFF',
};

export const LIGHT_COLORS: ColorPalette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceHighlight: '#EEEEF0',
  text: '#1A1A1F',
  textSecondary: '#6B6B7B',
  primary: '#3A7BD5',
  success: '#2EAD6F',
  warning: '#D4891E',
  pro: '#B08D2E',
  danger: '#DC3545',
  error: '#DC3545',
  border: '#D8D8DE',
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.05)',
  backgroundDeepNavy: '#E8EDF5',
  backgroundNavy: '#EDF1F8',
  cyan: '#0095B3',
  pillBorder: 'rgba(0, 0, 0, 0.08)',
  pillBackground: 'rgba(0, 0, 0, 0.03)',
  selectedPillBorder: '#0095B3',
  contrastText: '#FFFFFF',
};

export const DARK_GRADIENTS: GradientPalette = {
  background: ['#0A0A0F', '#1a1a3e', '#2d1b4e'] as const,
  card: ['#2D1B69', '#1A1035', '#0A0A0F'] as const,
  hero: ['#1E0A3C', '#0D0620'] as const,
  button: ['#8B5CF6', '#6D28D9'] as const,
  danger: ['#EF4444', '#7F1D1D'] as const,
  accent: ['#00D4FF', '#8B5CF6'] as const,
};

export const LIGHT_GRADIENTS: GradientPalette = {
  background: ['#F5F5F7', '#EDE4FF', '#E8E0FF'] as const,
  card: ['#E8E0FF', '#F0ECF8', '#F5F5F7'] as const,
  hero: ['#EDE4FF', '#F5F0FA'] as const,
  button: ['#7C4DFF', '#5B21B6'] as const,
  danger: ['#EF4444', '#B91C1C'] as const,
  accent: ['#00B4D8', '#7C4DFF'] as const,
};

export const DARK_GLOW: GlowPalette = {
  purple: 'rgba(139, 92, 246, 0.3)',
  cyan: 'rgba(0, 212, 255, 0.2)',
  danger: 'rgba(239, 68, 68, 0.3)',
};

export const LIGHT_GLOW: GlowPalette = {
  purple: 'rgba(139, 92, 246, 0.15)',
  cyan: 'rgba(0, 149, 179, 0.12)',
  danger: 'rgba(220, 53, 69, 0.15)',
};

export const DARK_SHADOWS: ShadowPalette = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
};

export const LIGHT_SHADOWS: ShadowPalette = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};
