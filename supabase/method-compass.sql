-- NOVA Compass (5-step method check-in) + practice library
-- Safe to run more than once.

-- 1. Check-in history
CREATE TABLE IF NOT EXISTS method_check_ins (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  energy_before INTEGER,
  tension_before INTEGER,
  energy_after INTEGER,
  tension_after INTEGER,
  steps_visited TEXT[],
  practices_used TEXT[],
  data JSONB
);

CREATE INDEX IF NOT EXISTS method_check_ins_user_idx ON method_check_ins (user_id, created_at DESC);

ALTER TABLE method_check_ins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "App full access" ON method_check_ins;
CREATE POLICY "App full access" ON method_check_ins FOR ALL USING (true) WITH CHECK (true);

-- 2. Practice library (audio links managed here, no code changes needed)
CREATE TABLE IF NOT EXISTS practices (
  slug TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  audio_url TEXT,
  course_url TEXT,
  duration_label TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read practices" ON practices;
CREATE POLICY "Anyone can read practices" ON practices FOR SELECT USING (true);

INSERT INTO practices (slug, title) VALUES
  ('open-loop-reset', 'Open Loop Reset'),
  ('expand-breath', 'Expand Breath Practice'),
  ('regulation-breath', 'The Regulation Breath'),
  ('shake-for-sanity', 'Shake for Sanity'),
  ('nova-recode', 'NOVA Recode'),
  ('where-focus-goes', 'Where Focus Goes, Energy Flows'),
  ('future-visualization', 'Future Visualization'),
  ('affirmation-meditation', 'Affirmation Meditation'),
  ('intentional-focus', 'Intentional Focus Practice')
ON CONFLICT (slug) DO NOTHING;
