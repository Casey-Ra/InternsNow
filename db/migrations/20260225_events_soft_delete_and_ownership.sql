BEGIN;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS created_by_email TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT;

CREATE INDEX IF NOT EXISTS idx_events_deleted_at
  ON public.events (deleted_at);

CREATE INDEX IF NOT EXISTS idx_events_created_by
  ON public.events (created_by);

COMMIT;
