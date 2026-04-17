CREATE TABLE IF NOT EXISTS student_hustle_activity (
  id TEXT PRIMARY KEY,
  auth0_sub TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT,
  reference_key TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  source_label TEXT NOT NULL,
  source_url TEXT,
  source_date TEXT,
  source_time TEXT,
  source_location TEXT,
  source_ends_at TIMESTAMPTZ,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_hustle_activity_user_date
  ON student_hustle_activity (auth0_sub, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_hustle_activity_reference
  ON student_hustle_activity (auth0_sub, reference_key);

CREATE INDEX IF NOT EXISTS idx_student_hustle_activity_pending
  ON student_hustle_activity (auth0_sub, activity_type, source_ends_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_hustle_activity_dedupe
  ON student_hustle_activity (auth0_sub, dedupe_key);
