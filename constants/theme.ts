export const COLORS = {
  background: '#0A0A0F',
  surface: '#16161E',
  surfaceHighlight: '#1F1F2C',
  text: '#E8E8ED',
  textSecondary: '#6B6B7B',
  primary: '#4A90D9',
  success: '#3DD68C',
  warning: '#F0A030', // SOS/Warning
  pro: '#C8A84E',
  danger: '#EF4444', // Use sparingly
  error: '#EF4444', // Alias for danger
  border: '#2A2A35',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  // QUITTR-inspired additions
  backgroundDeepNavy: '#0B1026',
  backgroundNavy: '#0D1B2A',
  cyan: '#00D4FF',
  pillBorder: 'rgba(255, 255, 255, 0.12)',
  pillBackground: 'rgba(255, 255, 255, 0.05)',
  selectedPillBorder: '#00B4D8',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screenPadding: 20,
};

export const RADIUS = {
  sm: 6,
  md: 10, // Button radius
  lg: 12, // Card radius
  xl: 16,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16, // Body
  lg: 18,
  xl: 20, // Section Header
  xxl: 24,
  xxxl: 32,
  display: 48,
};

export const GRADIENTS = {
  card: ['#2D1B69', '#1A1035', '#0A0A0F'] as const,
  hero: ['#1E0A3C', '#0D0620'] as const,
  button: ['#8B5CF6', '#6D28D9'] as const,
  danger: ['#EF4444', '#7F1D1D'] as const,
  accent: ['#00D4FF', '#8B5CF6'] as const,
};

export const GLOW = {
  purple: 'rgba(139, 92, 246, 0.3)',
  cyan: 'rgba(0, 212, 255, 0.2)',
  danger: 'rgba(239, 68, 68, 0.3)',
};

export const LAYOUT = {
  buttonHeight: 52,
};
