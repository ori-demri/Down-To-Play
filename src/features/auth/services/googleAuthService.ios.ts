/**
 * Google Auth Service - iOS Implementation
 * Uses @novastera-oss/rn-google-signin for native Google Sign-In on iOS
 */

import GoogleSignin from '@novastera-oss/rn-google-signin';
import { appLogger } from '@/utils/logger';
import type { GoogleSignInResult } from './googleAuthService';

// Configuration from environment
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let isConfigured = false;

/**
 * Configure Google Sign-In for iOS
 * Must be called before any sign-in operations
 */
export function configureGoogleSignIn(): void {
  if (isConfigured) {
    return;
  }

  if (!WEB_CLIENT_ID) {
    appLogger.warn('Google Sign-In: WEB_CLIENT_ID not configured');
    return;
  }

  try {
    GoogleSignin.configure({
      // Web client ID is required for getting idToken
      webClientId: WEB_CLIENT_ID,
      // iOS client ID
      iosClientId: IOS_CLIENT_ID,
      // Request offline access for refresh tokens
      offlineAccess: false,
    });

    isConfigured = true;
    appLogger.info('Google Sign-In configured (iOS)');
  } catch (error) {
    appLogger.error('Failed to configure Google Sign-In (iOS)', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Sign in with Google on iOS
 * Returns the ID token to be used with Supabase
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    // Ensure configured
    if (!isConfigured) {
      configureGoogleSignIn();
    }

    if (!isConfigured) {
      return {
        success: false,
        error: 'Google Sign-In not configured. Please check your environment variables.',
      };
    }

    // Perform sign in
    const response = await GoogleSignin.signIn({});

    if (response && response.idToken) {
      appLogger.info('Google Sign-In successful (iOS)', { userId: response.user.id });
      return {
        success: true,
        idToken: response.idToken,
      };
    }

    // No ID token received
    appLogger.error('Google Sign-In: No ID token received (iOS)');
    return {
      success: false,
      error: 'No ID token received from Google. Please try again.',
    };
  } catch (error: unknown) {
    const errorObj = error as { code?: string; message?: string };
    const errorCode = errorObj?.code;
    const errorMessage = errorObj?.message || 'Unknown error';

    // Handle specific error codes
    if (
      errorCode === 'SIGN_IN_CANCELLED' ||
      errorCode === '12501' ||
      errorMessage?.includes('cancel')
    ) {
      appLogger.info('Google Sign-In cancelled by user (iOS)');
      return {
        success: false,
        cancelled: true,
      };
    }

    if (errorCode === 'IN_PROGRESS') {
      appLogger.warn('Google Sign-In already in progress (iOS)');
      return {
        success: false,
        error: 'Sign-in already in progress',
      };
    }

    // Generic error
    appLogger.error('Google Sign-In error (iOS)', { code: errorCode, message: errorMessage });
    return {
      success: false,
      error: errorMessage || 'Failed to sign in with Google',
    };
  }
}

/**
 * Sign out from Google on iOS
 */
export async function signOutFromGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
    appLogger.info('Google Sign-Out successful (iOS)');
  } catch (error: unknown) {
    appLogger.error('Google Sign-Out error (iOS)', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Check if user is currently signed in to Google
 */
export async function isGoogleSignedIn(): Promise<boolean> {
  try {
    return await GoogleSignin.isSignedIn();
  } catch {
    return false;
  }
}

/**
 * Get current Google user info (if signed in)
 */
export async function getCurrentGoogleUser() {
  try {
    return await GoogleSignin.getCurrentUser();
  } catch {
    return null;
  }
}

/**
 * Revoke Google access (for account deletion flows)
 */
export async function revokeGoogleAccess(): Promise<void> {
  try {
    await GoogleSignin.revokeAccess();
    appLogger.info('Google access revoked (iOS)');
  } catch (error: unknown) {
    appLogger.error('Failed to revoke Google access (iOS)', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Check if Google Sign-In is properly configured
 */
export function isGoogleAuthConfigured(): boolean {
  return !!WEB_CLIENT_ID;
}

export const googleAuthService = {
  configure: configureGoogleSignIn,
  signIn: signInWithGoogle,
  signOut: signOutFromGoogle,
  isSignedIn: isGoogleSignedIn,
  getCurrentUser: getCurrentGoogleUser,
  revokeAccess: revokeGoogleAccess,
  isConfigured: isGoogleAuthConfigured,
};
