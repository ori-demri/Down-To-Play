// App theme constants

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  map: {
    fieldMarker: string;
    selectedMarker: string;
    userLocation: string;
  };
  overlay: string;
}

const lightColors: ThemeColors = {
  primary: '#10B981', // Emerald green - represents grass/football
  primaryDark: '#059669',
  primaryLight: '#34D399',

  secondary: '#3B82F6', // Blue for accents
  secondaryDark: '#2563EB',

  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceElevated: '#FFFFFF',

  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  border: '#E5E7EB',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  map: {
    fieldMarker: '#10B981',
    selectedMarker: '#059669',
    userLocation: '#3B82F6',
  },

  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors: ThemeColors = {
  primary: '#10B981', // Keep primary consistent
  primaryDark: '#059669',
  primaryLight: '#34D399',

  secondary: '#60A5FA', // Lighter blue for dark mode
  secondaryDark: '#3B82F6',

  background: '#0F172A', // Slate 900
  surface: '#1E293B', // Slate 800
  surfaceElevated: '#334155', // Slate 700

  text: {
    primary: '#F8FAFC', // Slate 50
    secondary: '#94A3B8', // Slate 400
    muted: '#64748B', // Slate 500
    inverse: '#0F172A',
  },

  border: '#334155', // Slate 700

  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  map: {
    fieldMarker: '#10B981',
    selectedMarker: '#34D399',
    userLocation: '#60A5FA',
  },

  overlay: 'rgba(0, 0, 0, 0.7)',
};

// Default colors export for backward compatibility (will be replaced by ThemeContext)
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
