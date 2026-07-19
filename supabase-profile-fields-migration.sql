-- Add new profile fields for richer personalization
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS education text;
