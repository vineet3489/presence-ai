-- Run this in your Supabase SQL editor

-- Add gamification columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS presence_xp   integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tip_streak    integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_tip_date date;

-- Daily tips table
CREATE TABLE IF NOT EXISTS daily_tips (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date         date NOT NULL,
  category     text NOT NULL CHECK (category IN ('voice', 'aura', 'dating')),
  tip_text     text NOT NULL,
  completed    boolean DEFAULT false,
  completed_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own tips"
  ON daily_tips FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS daily_tips_user_date ON daily_tips(user_id, date DESC);
