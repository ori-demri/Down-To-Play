import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// These should be set in your environment variables
// For Expo, use app.config.js with expo-constants
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'YOUR_SUPABASE_PUBLISHABLE_KEY';

// Validate Supabase configuration on startup
const isConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_PUBLISHABLE_KEY !== 'YOUR_SUPABASE_PUBLISHABLE_KEY';

if (!isConfigured && __DEV__) {
  console.warn(
    '⚠️ Supabase credentials not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your environment.'
  );
}

// Using untyped client for flexibility - types are enforced at repository level
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Storage bucket names
export const STORAGE_BUCKETS = {
  FIELD_IMAGES: 'field-images',
} as const;
