/**
 * Theme Context
 * Provides theme state and methods throughout the app
 * Supports light, dark, and system preference modes
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeColors,
  ThemeMode,
  colors as lightColors,
  darkColors,
  spacing,
  borderRadius,
  typography,
} from '@/constants/theme';
import { AppearancePreference } from '@/features/auth/types';

const THEME_STORAGE_KEY = '@app_theme_preference';

// Google Maps dark mode style
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64779e' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334e87' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6f9ba5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3C7680' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0d5ce' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.fill',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#3a4762' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e6d70' }],
  },
];

interface ThemeContextValue {
  /** Current resolved theme mode (always 'light' or 'dark') */
  mode: ThemeMode;
  /** User's appearance preference ('light', 'dark', or 'system') */
  preference: AppearancePreference;
  /** Current theme colors */
  colors: ThemeColors;
  /** Whether dark mode is active */
  isDark: boolean;
  /** Spacing values */
  spacing: typeof spacing;
  /** Border radius values */
  borderRadius: typeof borderRadius;
  /** Typography values */
  typography: typeof typography;
  /** Google Maps custom style for dark mode */
  mapStyle: typeof darkMapStyle | undefined;
  /** Set appearance preference */
  setAppearance: (preference: AppearancePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Initial appearance preference (from user profile or default) */
  initialPreference?: AppearancePreference;
  /** Callback when appearance changes (to sync with profile) */
  onAppearanceChange?: (preference: AppearancePreference) => void;
}

/**
 * Theme Provider
 * Manages theme state and provides theme values to the app
 */
export function ThemeProvider({
  children,
  initialPreference = 'system',
  onAppearanceChange,
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<AppearancePreference>(initialPreference);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference from AsyncStorage on mount
  useEffect(() => {
    const loadSavedPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setPreferenceState(saved as AppearancePreference);
        }
      } catch {
        // Ignore errors, use default
      } finally {
        setIsLoaded(true);
      }
    };
    loadSavedPreference();
  }, []);

  // Update preference when initialPreference changes (e.g., after profile loads)
  // Only update if profile preference differs from local storage
  useEffect(() => {
    if (isLoaded && initialPreference !== preference) {
      setPreferenceState(initialPreference);
      // Save to local storage for faster loading next time
      AsyncStorage.setItem(THEME_STORAGE_KEY, initialPreference).catch(() => undefined);
    }
  }, [initialPreference, isLoaded, preference]);

  // Resolve the actual mode based on preference and system setting
  const mode: ThemeMode = useMemo(() => {
    if (preference === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return preference;
  }, [preference, systemColorScheme]);

  const isDark = mode === 'dark';
  const themeColors = isDark ? darkColors : lightColors;
  const mapStyle = isDark ? darkMapStyle : undefined;

  const setAppearance = useCallback(
    (newPreference: AppearancePreference) => {
      setPreferenceState(newPreference);
      // Save to local storage for faster loading next time
      AsyncStorage.setItem(THEME_STORAGE_KEY, newPreference).catch(() => undefined);
      onAppearanceChange?.(newPreference);
    },
    [onAppearanceChange]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      preference,
      colors: themeColors,
      isDark,
      spacing,
      borderRadius,
      typography,
      mapStyle,
      setAppearance,
    }),
    [mode, preference, themeColors, isDark, mapStyle, setAppearance]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
