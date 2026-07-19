-- PresenceAI v2.1 Migration
-- Run all in order in Supabase SQL editor

-- 1. New columns on user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS primary_goal TEXT DEFAULT 'dating',
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS biometric_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS coaching_memory JSONB DEFAULT '{"patterns":{},"history":[],"coach_observations":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS transformation_roadmap JSONB,
  ADD COLUMN IF NOT EXISTS scorecard_slug TEXT,
  ADD COLUMN IF NOT EXISTS challenge_opted_in BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS place_of_birth TEXT;

-- 2. Unique scorecard slug index
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_scorecard_slug
  ON public.user_profiles (scorecard_slug)
  WHERE scorecard_slug IS NOT NULL;

-- 3. Rename daily_tips → daily_missions and add new columns
-- (skip the rename if you want to keep both tables during transition)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_tips' AND table_schema = 'public') THEN
    ALTER TABLE public.daily_tips RENAME TO daily_missions;
  END IF;
END $$;

ALTER TABLE public.daily_missions
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'easy',
  ADD COLUMN IF NOT EXISTS why_text TEXT,
  ADD COLUMN IF NOT EXISTS xp_value INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS reflection_text TEXT,
  ADD COLUMN IF NOT EXISTS coach_response TEXT;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'daily_missions' AND column_name = 'tip_text' AND table_schema = 'public') THEN
    ALTER TABLE public.daily_missions RENAME COLUMN tip_text TO mission_text;
  END IF;
END $$;

-- 4. Community challenge table
CREATE TABLE IF NOT EXISTS public.community_challenge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  display_name TEXT,
  challenge_day INTEGER DEFAULT 1,
  missions_completed INTEGER DEFAULT 0,
  practice_sessions INTEGER DEFAULT 0,
  consecutive_days INTEGER DEFAULT 0,
  completion_pct INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Consent log table
CREATE TABLE IF NOT EXISTS public.user_consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consented_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- 6. RLS
ALTER TABLE public.community_challenge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consent_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Community challenge readable by authenticated"
  ON public.community_challenge FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users manage own challenge row"
  ON public.community_challenge FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users manage own consent log"
  ON public.user_consent_log FOR ALL
  USING (auth.uid() = user_id);

-- 7. Performance indexes
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_type_date
  ON public.analysis_sessions (user_id, session_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date
  ON public.daily_missions (user_id, date);

CREATE INDEX IF NOT EXISTS idx_community_challenge_city_completion
  ON public.community_challenge (city, completion_pct DESC);
