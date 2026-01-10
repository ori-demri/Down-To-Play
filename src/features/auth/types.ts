/**
 * Authentication types and interfaces
 */

import { Session, User } from '@supabase/supabase-js';

// ============================================
// User Profile Types
// ============================================

/**
 * User profile stored in Supabase profiles table
 */
export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Raw profile data from Supabase (snake_case)
 */
export interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Google user metadata from OAuth response
 */
export interface GoogleUserMetadata {
  full_name?: string;
  name?: string;
  avatar_url?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  iss?: string;
  sub?: string;
}

// ============================================
// Auth State Types
// ============================================

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
}

/**
 * Auth context value exposed to consumers
 */
export interface AuthContextValue extends AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user is browsing as guest */
  isGuest: boolean;
  /** Sign in with Google */
  signInWithGoogle: () => Promise<AuthResult>;
  /** Sign out current user */
  signOut: () => Promise<void>;
  /** Refresh user profile from database */
  refreshProfile: () => Promise<void>;
  /** Set auth intent for after login */
  setAuthIntent: (intent: AuthIntent) => void;
  /** Get and clear auth intent */
  consumeAuthIntent: () => AuthIntent;
}

// ============================================
// Auth Operation Types
// ============================================

/**
 * Result of an auth operation
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}

/**
 * Intent to perform after authentication
 * Used to redirect users to their intended action after login
 */
export type AuthIntent =
  | { type: 'add_field' }
  | { type: 'create_game'; fieldId: string }
  | { type: 'join_game'; gameId: string }
  | { type: 'view_profile'; userId: string }
  | null;

// ============================================
// Profile Creation Types
// ============================================

/**
 * Data needed to create a new profile
 */
export interface CreateProfileData {
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Data for updating a profile
 */
export interface UpdateProfileData {
  displayName?: string;
  avatarUrl?: string;
  username?: string;
}
