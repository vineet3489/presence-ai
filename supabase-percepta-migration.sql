-- Percepta Migration — perception simulation feature
-- Run in Supabase SQL editor

-- 1. Bio field + free-tier daily counter on user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS bio_text TEXT,
  ADD COLUMN IF NOT EXISTS sim_count_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sim_count_date DATE;

-- 2. Simulation results (one row per persona run)
CREATE TABLE IF NOT EXISTS public.simulation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL,
  photo_storage_path TEXT,
  bio_text TEXT,
  swipe_probability NUMERIC(5,2),
  reply_probability NUMERIC(5,2),
  profile_strength_score NUMERIC(5,2),
  tags JSONB,
  narrative TEXT,
  optimizer_result JSONB,
  parent_simulation_id UUID REFERENCES public.simulation_results(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own simulation results" ON public.simulation_results;
CREATE POLICY "Users manage own simulation results"
  ON public.simulation_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_simulation_results_user_persona_date
  ON public.simulation_results (user_id, persona_id, created_at DESC);

-- 3. Improvement log (audit trail linking a before/after pair to the applied suggestion)
CREATE TABLE IF NOT EXISTS public.improvement_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  before_simulation_id UUID NOT NULL REFERENCES public.simulation_results(id) ON DELETE CASCADE,
  after_simulation_id UUID REFERENCES public.simulation_results(id) ON DELETE SET NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('bio_rewrite', 'manual_edit')),
  suggestion_detail JSONB,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.improvement_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own improvement log" ON public.improvement_log;
CREATE POLICY "Users manage own improvement log"
  ON public.improvement_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_improvement_log_user_date
  ON public.improvement_log (user_id, applied_at DESC);
