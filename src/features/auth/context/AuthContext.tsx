/**
 * Authentication Context
 * Provides auth state and methods throughout the app
 * Uses @novastera-oss/rn-google-signin for native Google Sign-In
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { profileRepository } from '@/features/auth/repositories/profileRepository';
import { googleAuthService } from '@/features/auth/services/googleAuthService';
import {
  AuthContextValue,
  AuthState,
  AuthResult,
  AuthIntent,
  UserProfile,
  GoogleUserMetadata,
} from '@/features/auth/types';
import { supabase } from '@/infrastructure/supabase';
import { appLogger } from '@/utils/logger';

// Initial auth state
const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
};

// Create the context
const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider
 * Manages auth state, session, and profile
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  // Refs for managing async operations and intents
  const isMountedRef = useRef(true);
  const authIntentRef = useRef<AuthIntent>(null);
  const isSigningInRef = useRef(false);

  /**
   * Safe state updater that checks mount status
   */
  const safeSetState = useCallback((updates: Partial<AuthState>) => {
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  /**
   * Load user profile from database
   */
  const loadProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
      appLogger.debug('Loading profile', { userId: user.id });

      const profile = await profileRepository.getById(user.id);

      if (profile) {
        appLogger.debug('Profile loaded', { username: profile.username });
        return profile;
      }

      // Profile doesn't exist - create it
      const metadata = user.user_metadata as GoogleUserMetadata | undefined;
      const email = user.email || metadata?.email;

      if (!email) {
        appLogger.error('Cannot create profile: no email available');
        return null;
      }

      const newProfile = await profileRepository.create({
        userId: user.id,
        email,
        displayName: metadata?.full_name || metadata?.name,
        avatarUrl: metadata?.avatar_url || metadata?.picture,
      });

      if (newProfile) {
        appLogger.info('Profile created for new user', { username: newProfile.username });
      }

      return newProfile;
    } catch (error) {
      appLogger.error('Failed to load/create profile', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }, []);

  /**
   * Handle session change
   */
  const handleSessionChange = useCallback(
    async (session: Session | null) => {
      if (session?.user) {
        const profile = await loadProfile(session.user);
        safeSetState({
          user: session.user,
          session,
          profile,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        safeSetState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    },
    [loadProfile, safeSetState]
  );

  /**
   * Initialize auth state
   */
  useEffect(() => {
    isMountedRef.current = true;
    appLogger.info('AuthProvider initializing');

    // Configure Google Sign-In
    googleAuthService.configure();

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        await handleSessionChange(session);
        appLogger.info('Auth initialized', { hasSession: !!session });
      } catch (error) {
        appLogger.error('Auth initialization failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        safeSetState({
          isLoading: false,
          isInitialized: true,
        });
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      appLogger.debug('Auth state changed', { event });

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await handleSessionChange(session);
      } else if (event === 'SIGNED_OUT') {
        safeSetState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
        });
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [handleSessionChange, safeSetState]);

  /**
   * Handle app state changes for token refresh
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && state.session) {
        // Refresh session when app comes to foreground
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            safeSetState({ session });
          }
        } catch (error) {
          appLogger.error('Failed to refresh session', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [state.session, safeSetState]);

  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (isSigningInRef.current) {
      return { success: false, error: 'Sign-in already in progress' };
    }

    isSigningInRef.current = true;
    safeSetState({ isLoading: true });

    try {
      // Step 1: Get Google ID token using native sign-in
      const googleResult = await googleAuthService.signIn();

      if (!googleResult.success) {
        safeSetState({ isLoading: false });
        isSigningInRef.current = false;

        if (googleResult.cancelled) {
          return { success: false, cancelled: true };
        }
        return { success: false, error: googleResult.error };
      }

      // Step 2: Exchange ID token with Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: googleResult.idToken!,
      });

      if (error) {
        appLogger.error('Supabase sign-in failed', { error: error.message });
        safeSetState({ isLoading: false });
        isSigningInRef.current = false;
        return { success: false, error: error.message };
      }

      // Session will be handled by onAuthStateChange
      appLogger.info('Sign-in successful', { userId: data.user?.id });
      isSigningInRef.current = false;
      return { success: true };
    } catch (error) {
      appLogger.error('Sign-in error', {
        error: error instanceof Error ? error.message : String(error),
      });
      safeSetState({ isLoading: false });
      isSigningInRef.current = false;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }, [safeSetState]);

  /**
   * Sign out
   */
  const signOut = useCallback(async (): Promise<void> => {
    safeSetState({ isLoading: true });

    try {
      // Sign out from Google
      await googleAuthService.signOut();

      // Sign out from Supabase
      await supabase.auth.signOut();

      appLogger.info('Sign-out successful');
    } catch (error) {
      appLogger.error('Sign-out error', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      safeSetState({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
      });
    }
  }, [safeSetState]);

  /**
   * Refresh user profile
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!state.user) {
      return;
    }

    try {
      const profile = await profileRepository.getById(state.user.id);
      if (profile) {
        safeSetState({ profile });
      }
    } catch (error) {
      appLogger.error('Failed to refresh profile', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [state.user, safeSetState]);

  /**
   * Set auth intent
   */
  const setAuthIntent = useCallback((intent: AuthIntent): void => {
    authIntentRef.current = intent;
    appLogger.debug('Auth intent set', { type: intent?.type });
  }, []);

  /**
   * Consume auth intent (get and clear)
   */
  const consumeAuthIntent = useCallback((): AuthIntent => {
    const intent = authIntentRef.current;
    authIntentRef.current = null;
    if (intent) {
      appLogger.debug('Auth intent consumed', { type: intent.type });
    }
    return intent;
  }, []);

  // Build context value
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: !!state.session && !!state.user,
      isGuest: !state.session && state.isInitialized,
      signInWithGoogle,
      signOut,
      refreshProfile,
      setAuthIntent,
      consumeAuthIntent,
    }),
    [state, signInWithGoogle, signOut, refreshProfile, setAuthIntent, consumeAuthIntent]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}
