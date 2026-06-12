-- Run in Supabase SQL editor to fix missing indexes causing full table scans at scale.
-- Safe to run multiple times (all use IF NOT EXISTS).

-- Composite index for the most common query pattern:
-- "get latest N sessions of a specific type for a user"
-- Used by: avatar/generate, style-profile, analyze-appearance history
CREATE INDEX IF NOT EXISTS idx_sessions_user_type_date
  ON public.analysis_sessions(user_id, session_type, created_at DESC);

-- Index for daily_tips lookups (user + date + completed status)
-- Used by: /api/daily-tips on every dashboard load
CREATE INDEX IF NOT EXISTS idx_daily_tips_user_date
  ON public.daily_tips(user_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_tips_user_completed
  ON public.daily_tips(user_id, completed);

-- Index for user_profiles lookups (already has user_id unique but an explicit index helps the planner)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
  ON public.user_profiles(user_id);
