/**
 * Google Auth Service
 *
 * Platform-specific implementations:
 * - iOS: Uses @novastera-oss/rn-google-signin (googleAuthService.ios.ts)
 * - Android: Uses react-native-credentials-manager (googleAuthService.android.ts)
 *
 * React Native's metro bundler automatically resolves platform-specific files
 * (.ios.ts / .android.ts) at build time.
 *
 * This file serves as:
 * 1. Shared type definitions
 * 2. Fallback for non-mobile platforms (web)
 */

import { Platform } from 'react-native';
import { appLogger } from '@/utils/logger';

// ============================================
// Shared Types
// ============================================

/**
 * Result of Google Sign-In operation
 */
export interface GoogleSignInResult {
  success: boolean;
  idToken?: string;
  error?: string;
  cancelled?: boolean;
}

/**
 * Google Auth Service interface
 */
export interface GoogleAuthServiceInterface {
  configure: () => void;
  signIn: () => Promise<GoogleSignInResult>;
  signOut: () => Promise<void>;
  isSignedIn: () => Promise<boolean>;
  getCurrentUser: () => Promise<unknown>;
  revokeAccess: () => Promise<void>;
  isConfigured: () => boolean;
}

// ============================================
// Web/Default Implementation (Fallback)
// ============================================

// Configuration from environment
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/**
 * Configure Google Sign-In (web fallback - not implemented)
 */
export function configureGoogleSignIn(): void {
  if (Platform.OS === 'web') {
    appLogger.warn('Google Sign-In: Web platform not yet supported');
  }
}

/**
 * Sign in with Google (web fallback - not implemented)
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (Platform.OS === 'web') {
    appLogger.warn('Google Sign-In: Web platform not yet supported');
    return {
      success: false,
      error: 'Google Sign-In is not supported on web. Please use the mobile app.',
    };
  }

  // This shouldn't be reached on mobile as platform-specific files are used
  return {
    success: false,
    error: 'Platform not supported',
  };
}

/**
 * Sign out from Google (web fallback)
 */
export async function signOutFromGoogle(): Promise<void> {
  if (Platform.OS === 'web') {
    appLogger.warn('Google Sign-Out: Web platform not yet supported');
  }
}

/**
 * Check if user is currently signed in to Google
 */
export async function isGoogleSignedIn(): Promise<boolean> {
  return false;
}

/**
 * Get current Google user info
 */
export async function getCurrentGoogleUser() {
  return null;
}

/**
 * Revoke Google access
 */
export async function revokeGoogleAccess(): Promise<void> {
  if (Platform.OS === 'web') {
    appLogger.warn('Google revoke access: Web platform not yet supported');
  }
}

/**
 * Check if Google Sign-In is properly configured
 */
export function isGoogleAuthConfigured(): boolean {
  return !!WEB_CLIENT_ID;
}

export const googleAuthService: GoogleAuthServiceInterface = {
  configure: configureGoogleSignIn,
  signIn: signInWithGoogle,
  signOut: signOutFromGoogle,
  isSignedIn: isGoogleSignedIn,
  getCurrentUser: getCurrentGoogleUser,
  revokeAccess: revokeGoogleAccess,
  isConfigured: isGoogleAuthConfigured,
};
