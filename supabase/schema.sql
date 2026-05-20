-- NOVA OS Supabase Schema
-- Run this in your Supabase SQL editor to set up the database.
-- All tables use UUID primary keys and Row Level Security (RLS).

-- ─── Enable UUID extension ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  primary_goal TEXT,
  main_struggle TEXT,
  preferred_tone TEXT CHECK (preferred_tone IN ('direct', 'warm', 'scientific', 'minimal')),
  caffeine_level TEXT CHECK (caffeine_level IN ('none', 'low', 'moderate', 'high')),
  desired_feeling TEXT,
  -- NOVA program status
  masterclass_completed BOOLEAN DEFAULT FALSE,
  in_program BOOLEAN DEFAULT FALSE,
  program_week INTEGER CHECK (program_week BETWEEN 1 AND 7),
  energy_reset_completed BOOLEAN DEFAULT FALSE
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);

-- ─── Daily Check-Ins ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  morning_energy INTEGER CHECK (morning_energy BETWEEN 1 AND 10),
  mental_clarity INTEGER CHECK (mental_clarity BETWEEN 1 AND 10),
  stress_pressure INTEGER CHECK (stress_pressure BETWEEN 1 AND 10),
  body_tension INTEGER CHECK (body_tension BETWEEN 1 AND 10),
  cravings TEXT CHECK (cravings IN ('none', 'mild', 'strong')),
  emotional_state TEXT, -- 24 possible values — no constraint to allow future expansion
  focus_capacity TEXT CHECK (focus_capacity IN ('deep_focus','light_focus','scattered','avoidant','shutdown')),
  caffeine_desire TEXT CHECK (caffeine_desire IN ('none','normal','strong','desperate')),
  free_text TEXT,
  ai_state_label TEXT,
  ai_summary TEXT,
  ai_recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own check-ins"
  ON daily_check_ins FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_check_ins_user_date ON daily_check_ins(user_id, date DESC);

-- ─── Emergency Events ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'crashing','sugar_craving','cant_focus','anxious','emotionally_overwhelmed',
    'doom_scrolling','frozen_shutdown','tired_but_wired','irritated',
    'want_caffeine','want_to_give_up'
  )),
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  trigger_text TEXT,
  ai_pattern TEXT,
  ai_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emergency events"
  ON emergency_events FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_emergency_events_user ON emergency_events(user_id, created_at DESC);

-- ─── Chat Messages ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chat messages"
  ON chat_messages FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at ASC);

-- ─── User Insights ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('pattern', 'win', 'trend', 'recommendation')),
  insight_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own insights"
  ON user_insights FOR ALL USING (auth.uid() = user_id);
