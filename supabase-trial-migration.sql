-- Run this in Supabase SQL editor AFTER running supabase-migration-tips.sql

-- Add trial & subscription columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'trial', 'active', 'expired')),
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Give all existing users who completed onboarding a fresh 48-hour trial window
UPDATE public.user_profiles
SET
  trial_started_at = NOW(),
  subscription_status = 'trial'
WHERE
  onboarding_completed = true
  AND (subscription_status IS NULL OR subscription_status = 'none');
