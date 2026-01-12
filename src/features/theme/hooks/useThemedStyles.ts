/**
 * Hook for creating themed styles with caching
 * Prevents style recreation on theme changes for smoother transitions
 */

import { useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeColors, colors as lightColors, darkColors } from '@/constants/theme';

type StyleSheetStyles = ReturnType<typeof StyleSheet.create>;

/**
 * Cache for themed styles
 * Stores both light and dark versions of styles to avoid recreation
 */
const styleCache = new Map<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (colors: ThemeColors) => any,
  { light: StyleSheetStyles; dark: StyleSheetStyles }
>();

/**
 * Hook that returns cached themed styles based on current theme
 * Styles are created once for each theme and cached for reuse
 *
 * @param createStyles - Function that creates styles from theme colors
 * @param isDark - Whether dark mode is active
 * @returns Cached StyleSheet for the current theme
 */
export function useThemedStyles<T extends StyleSheetStyles>(
  createStyles: (colors: ThemeColors) => T,
  isDark: boolean
): T {
  // Use ref to store the createStyles function identity
  const createStylesRef = useRef(createStyles);
  createStylesRef.current = createStyles;

  return useMemo(() => {
    const cached = styleCache.get(createStylesRef.current);

    if (cached) {
      return (isDark ? cached.dark : cached.light) as T;
    }

    // Create and cache both versions
    const lightStyles = createStylesRef.current(lightColors);
    const darkStyles = createStylesRef.current(darkColors);

    styleCache.set(createStylesRef.current, {
      light: lightStyles,
      dark: darkStyles,
    });

    return (isDark ? darkStyles : lightStyles) as T;
  }, [isDark]);
}
