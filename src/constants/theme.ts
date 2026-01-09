// App theme constants

export const colors = {
  primary: '#10B981', // Emerald green - represents grass/football
  primaryDark: '#059669',
  primaryLight: '#34D399',
  
  secondary: '#3B82F6', // Blue for accents
  secondaryDark: '#2563EB',
  
  background: '#FFFFFF',
  surface: '#F9FAFB',
  
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
} as const;

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
