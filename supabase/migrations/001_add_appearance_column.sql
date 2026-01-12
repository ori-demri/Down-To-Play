-- Migration: Add appearance column to profiles table
-- Date: 2026-01-12
-- Description: Adds the appearance preference column to support light/dark/system theme modes
--
-- Run this in your Supabase Dashboard > SQL Editor if the column doesn't exist

-- First, create the enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE appearance_preference AS ENUM ('light', 'dark', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the appearance column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS appearance appearance_preference DEFAULT 'system' NOT NULL;

-- Verify the column was added
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'appearance';
