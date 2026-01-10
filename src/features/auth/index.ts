/**
 * Auth Feature - Public API
 */

// Context & Provider
export { AuthProvider, useAuthContext } from './context/AuthContext';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useRequireAuth, useIsAuthenticated } from './hooks/useRequireAuth';

// Services
export { googleAuthService } from './services/googleAuthService';

// Repository
export { profileRepository } from './repositories/profileRepository';

// Types
export type {
  UserProfile,
  AuthState,
  AuthContextValue,
  AuthResult,
  AuthIntent,
  GoogleUserMetadata,
  CreateProfileData,
  UpdateProfileData,
} from './types';
