/**
 * useRequireAuth Hook
 * For protecting actions that require authentication
 */

import { useCallback, useState } from 'react';
import { AuthIntent } from '@/features/auth/types';
import { useAuth } from './useAuth';

interface UseRequireAuthOptions {
  /** Called when user is not authenticated and needs to sign in */
  onAuthRequired?: () => void;
}

interface UseRequireAuthReturn {
  /** Whether the login modal should be shown */
  showLoginModal: boolean;
  /** Close the login modal */
  closeLoginModal: () => void;
  /** Wrap an action that requires authentication */
  requireAuth: <T>(
    action: () => T | Promise<T>,
    intent?: AuthIntent
  ) => Promise<{ success: boolean; result?: T; authRequired?: boolean }>;
  /** Check if authenticated and show login if not */
  checkAuth: (intent?: AuthIntent) => boolean;
}

/**
 * Hook for protecting actions that require authentication
 *
 * @example
 * ```tsx
 * const { requireAuth, showLoginModal, closeLoginModal } = useRequireAuth();
 *
 * const handleAddField = async () => {
 *   const { success, authRequired } = await requireAuth(
 *     () => openCreateFieldModal(),
 *     { type: 'add_field' }
 *   );
 *
 *   if (authRequired) {
 *     // User needs to log in first
 *     return;
 *   }
 * };
 *
 * return (
 *   <>
 *     <Button onPress={handleAddField}>Add Field</Button>
 *     <LoginModal visible={showLoginModal} onClose={closeLoginModal} />
 *   </>
 * );
 * ```
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}): UseRequireAuthReturn {
  const { isAuthenticated, setAuthIntent } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  /**
   * Check if user is authenticated, show login modal if not
   */
  const checkAuth = useCallback(
    (intent?: AuthIntent): boolean => {
      if (isAuthenticated) {
        return true;
      }

      // Store intent for after login
      if (intent) {
        setAuthIntent(intent);
      }

      // Show login modal
      setShowLoginModal(true);
      options.onAuthRequired?.();

      return false;
    },
    [isAuthenticated, setAuthIntent, options]
  );

  /**
   * Wrap an action that requires authentication
   */
  const requireAuth = useCallback(
    async <T>(
      action: () => T | Promise<T>,
      intent?: AuthIntent
    ): Promise<{ success: boolean; result?: T; authRequired?: boolean }> => {
      if (!isAuthenticated) {
        // Store intent for after login
        if (intent) {
          setAuthIntent(intent);
        }

        // Show login modal
        setShowLoginModal(true);
        options.onAuthRequired?.();

        return { success: false, authRequired: true };
      }

      try {
        const result = await action();
        return { success: true, result };
      } catch {
        return { success: false };
      }
    },
    [isAuthenticated, setAuthIntent, options]
  );

  return {
    showLoginModal,
    closeLoginModal,
    requireAuth,
    checkAuth,
  };
}

/**
 * Simple hook to check authentication status
 * Useful for conditional rendering
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to handle post-login intent execution
 */
export function useAuthIntentHandler(handlers: {
  add_field?: () => void;
  create_game?: (fieldId: string) => void;
  join_game?: (gameId: string) => void;
  view_profile?: (userId: string) => void;
}): void {
  const { isAuthenticated, consumeAuthIntent } = useAuth();

  // Execute intent when user becomes authenticated
  // This should be called in a useEffect in the component that handles intents
  const executeIntent = useCallback(() => {
    if (!isAuthenticated) return;

    const intent = consumeAuthIntent();
    if (!intent) return;

    switch (intent.type) {
      case 'add_field':
        handlers.add_field?.();
        break;
      case 'create_game':
        handlers.create_game?.(intent.fieldId);
        break;
      case 'join_game':
        handlers.join_game?.(intent.gameId);
        break;
      case 'view_profile':
        handlers.view_profile?.(intent.userId);
        break;
    }
  }, [isAuthenticated, consumeAuthIntent, handlers]);

  return executeIntent();
}
