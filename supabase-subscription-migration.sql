-- Run in Supabase SQL editor to add subscription tracking column.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- -----------------------------------------------------------------------
-- IMPORTANT: Run this ONE TIME just before you go live with the paywall.
-- It gives all existing users a fresh 3-day trial window so they aren't
-- locked out the moment the feature deploys.
-- -----------------------------------------------------------------------
-- UPDATE public.user_profiles
-- SET
--   subscription_status = 'trial',
--   trial_started_at = NOW()
-- WHERE onboarding_completed = true;
