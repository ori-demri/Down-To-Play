/**
 * Profile Repository
 * Handles all database operations for user profiles
 */

import {
  ProfileRow,
  UserProfile,
  CreateProfileData,
  UpdateProfileData,
} from '@/features/auth/types';
import { supabase } from '@/infrastructure/supabase';
import { appLogger } from '@/utils/logger';

/**
 * Transform database row to UserProfile
 */
function transformProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Generate a unique username from email
 * Format: name_randomsuffix (e.g., john_a1b2c3)
 */
function generateUsername(email: string): string {
  const localPart = email.split('@')[0];
  // Clean the local part: lowercase, replace non-alphanumeric with underscore
  const cleanName = localPart
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 20);

  // Add random suffix for uniqueness
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${cleanName}_${suffix}`;
}

export const profileRepository = {
  /**
   * Get profile by user ID
   */
  async getById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - profile doesn't exist yet
          return null;
        }
        throw error;
      }

      return transformProfile(data as ProfileRow);
    } catch (error) {
      appLogger.error('Failed to get profile', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  },

  /**
   * Get profile by username
   */
  async getByUsername(username: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return transformProfile(data as ProfileRow);
    } catch (error) {
      appLogger.error('Failed to get profile by username', {
        username,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  },

  /**
   * Create a new profile
   */
  async create(data: CreateProfileData): Promise<UserProfile | null> {
    try {
      // Generate unique username
      let username = generateUsername(data.email);
      let attempts = 0;
      const maxAttempts = 5;

      // Check for username collision and regenerate if needed
      while (attempts < maxAttempts) {
        const existing = await this.getByUsername(username);
        if (!existing) break;
        username = generateUsername(data.email);
        attempts++;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: data.userId,
          username,
          display_name: data.displayName || null,
          avatar_url: data.avatarUrl || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      appLogger.info('Profile created', { userId: data.userId, username });
      return transformProfile(profile as ProfileRow);
    } catch (error) {
      appLogger.error('Failed to create profile', {
        userId: data.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  },

  /**
   * Update an existing profile
   */
  async update(userId: string, data: UpdateProfileData): Promise<UserProfile | null> {
    try {
      const updateData: Record<string, unknown> = {};

      if (data.displayName !== undefined) {
        updateData.display_name = data.displayName;
      }
      if (data.avatarUrl !== undefined) {
        updateData.avatar_url = data.avatarUrl;
      }
      if (data.username !== undefined) {
        updateData.username = data.username;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      appLogger.info('Profile updated', { userId });
      return transformProfile(profile as ProfileRow);
    } catch (error) {
      appLogger.error('Failed to update profile', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  },

  /**
   * Ensure a profile exists for a user
   * Creates one if it doesn't exist, returns existing if it does
   */
  async ensureProfile(
    userId: string,
    email: string,
    metadata?: { fullName?: string; avatarUrl?: string }
  ): Promise<UserProfile | null> {
    // First, try to get existing profile
    const existing = await this.getById(userId);
    if (existing) {
      return existing;
    }

    // Create new profile
    return this.create({
      userId,
      email,
      displayName: metadata?.fullName,
      avatarUrl: metadata?.avatarUrl,
    });
  },

  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase.from('profiles').select('id').eq('username', username);

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return !data || data.length === 0;
    } catch (error) {
      appLogger.error('Failed to check username availability', {
        username,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  },
};
