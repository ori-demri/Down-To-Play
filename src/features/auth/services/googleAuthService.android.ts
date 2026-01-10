/**
 * Google Auth Service - Android Implementation
 * Uses react-native-credentials-manager for Google Sign-In via Android Credential Manager
 */

import {
  signUpWithGoogle as credentialManagerSignIn,
  signOut as credentialManagerSignOut,
} from 'react-native-credentials-manager';
import { appLogger } from '@/utils/logger';
import type { GoogleSignInResult } from './googleAuthService';

// Configuration from environment
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let isConfigured = false;

/**
 * Configure Google Sign-In for Android
 * Android Credential Manager doesn't require explicit configuration,
 * but we validate the required environment variables
 */
export function configureGoogleSignIn(): void {
  if (isConfigured) {
    return;
  }

  if (!WEB_CLIENT_ID) {
    appLogger.warn('Google Sign-In: WEB_CLIENT_ID not configured');
    return;
  }

  isConfigured = true;
  appLogger.info('Google Sign-In configured (Android)');
}

/**
 * Sign in with Google on Android using Credential Manager
 * Returns the ID token to be used with Supabase
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    // Ensure configured
    if (!isConfigured) {
      configureGoogleSignIn();
    }

    if (!isConfigured || !WEB_CLIENT_ID) {
      return {
        success: false,
        error: 'Google Sign-In not configured. Please check your environment variables.',
      };
    }

    // Request credential from Android Credential Manager
    const credential = await credentialManagerSignIn({
      serverClientId: WEB_CLIENT_ID,
      autoSelectEnabled: false, // Don't auto-select, let user choose
    });

    // Check if we got a valid Google credential with ID token
    if (credential.type === 'google-signin' && credential.idToken) {
      appLogger.info('Google Sign-In successful (Android)', {
        userId: credential.id,
      });
      return {
        success: true,
        idToken: credential.idToken,
      };
    }

    // No valid credential received
    appLogger.error('Google Sign-In: Invalid credential type or no ID token (Android)', {
      type: credential.type,
    });
    return {
      success: false,
      error: 'No valid Google credential received. Please try again.',
    };
  } catch (error: unknown) {
    const errorObj = error as { code?: string; message?: string; type?: string };
    const errorCode = errorObj?.code;
    const errorType = errorObj?.type;
    const errorMessage = errorObj?.message || 'Unknown error';

    // Handle user cancellation
    if (
      errorCode === 'CANCELED' ||
      errorCode === 'TYPE_NO_CREDENTIAL' ||
      errorType === 'android.credentials.GetCredentialException.TYPE_USER_CANCELED' ||
      errorMessage?.toLowerCase().includes('cancel') ||
      errorMessage?.toLowerCase().includes('user cancelled')
    ) {
      appLogger.info('Google Sign-In cancelled by user (Android)');
      return {
        success: false,
        cancelled: true,
      };
    }

    // Handle no credentials available
    if (
      errorType === 'android.credentials.GetCredentialException.TYPE_NO_CREDENTIAL' ||
      errorMessage?.includes('No credentials available')
    ) {
      appLogger.warn('No Google credentials available (Android)');
      return {
        success: false,
        error: 'No Google account found. Please add a Google account to your device.',
      };
    }

    // Generic error
    appLogger.error('Google Sign-In error (Android)', {
      code: errorCode,
      type: errorType,
      message: errorMessage,
    });
    return {
      success: false,
      error: errorMessage || 'Failed to sign in with Google',
    };
  }
}

/**
 * Sign out from Google on Android
 */
export async function signOutFromGoogle(): Promise<void> {
  try {
    await credentialManagerSignOut();
    appLogger.info('Google Sign-Out successful (Android)');
  } catch (error: unknown) {
    // Sign out may not be fully supported on all versions
    appLogger.warn('Google Sign-Out: may not be fully supported (Android)', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Check if user is currently signed in to Google
 * Note: Credential Manager is stateless, so this always returns false
 * The actual sign-in state is managed by Supabase
 */
export async function isGoogleSignedIn(): Promise<boolean> {
  // Credential Manager doesn't track sign-in state
  // Return false - actual state is managed by Supabase session
  return false;
}

/**
 * Get current Google user info
 * Note: Credential Manager doesn't maintain user state
 */
export async function getCurrentGoogleUser() {
  // Credential Manager doesn't track current user
  return null;
}

/**
 * Revoke Google access (for account deletion flows)
 * Note: For Credential Manager, this signs out
 */
export async function revokeGoogleAccess(): Promise<void> {
  try {
    await credentialManagerSignOut();
    appLogger.info('Google access revoked (Android)');
  } catch (error: unknown) {
    appLogger.warn('Failed to revoke Google access (Android)', {
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
