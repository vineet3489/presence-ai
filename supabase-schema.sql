-- Run this in Supabase SQL editor to set up the database schema

-- User profiles (one per user)
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  big_five jsonb default '{"openness":3,"conscientiousness":3,"extraversion":3,"agreeableness":3,"neuroticism":3}',
  style_preference text default 'smart-casual',
  goals text[] default array[]::text[],
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

-- Analysis sessions (one per scan/check)
create table if not exists public.analysis_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_type text not null check (session_type in ('appearance', 'voice', 'date_prep')),
  appearance_data jsonb,
  appearance_result jsonb,
  voice_data jsonb,
  voice_result jsonb,
  date_prep_data jsonb,
  date_prep_result jsonb,
  appearance_score numeric(5,2),
  voice_score numeric(5,2),
  social_score numeric(5,2),
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.user_profiles enable row level security;
alter table public.analysis_sessions enable row level security;

-- Drop existing policies if they exist, then recreate
drop policy if exists "Users can manage own profile" on public.user_profiles;
drop policy if exists "Users can manage own sessions" on public.analysis_sessions;

-- Policies: users can only access their own data
create policy "Users can manage own profile"
  on public.user_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own sessions"
  on public.analysis_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast session lookups
create index if not exists idx_sessions_user_id on public.analysis_sessions(user_id, created_at desc);
