/**
 * useAuth Hook
 * Convenience hook for accessing auth state and methods
 */

import { useAuthContext } from '@/features/auth/context/AuthContext';

/**
 * Main authentication hook
 * Provides access to auth state and methods
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth();
 *
 * if (isAuthenticated) {
 *   return <Text>Welcome, {user?.email}</Text>;
 * }
 * ```
 */
export function useAuth() {
  const context = useAuthContext();

  return {
    // State
    user: context.user,
    session: context.session,
    profile: context.profile,
    isLoading: context.isLoading,
    isInitialized: context.isInitialized,
    isAuthenticated: context.isAuthenticated,
    isGuest: context.isGuest,

    // Methods
    signInWithGoogle: context.signInWithGoogle,
    signOut: context.signOut,
    refreshProfile: context.refreshProfile,
    setAuthIntent: context.setAuthIntent,
    consumeAuthIntent: context.consumeAuthIntent,
  };
}
