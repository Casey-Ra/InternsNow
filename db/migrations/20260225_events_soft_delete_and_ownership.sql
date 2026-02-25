BEGIN;

DO $$
BEGIN
  IF to_regclass('public.events') IS NULL THEN
    RAISE NOTICE 'public.events table does not exist; skipping events ownership/soft-delete migration';
  ELSE
    ALTER TABLE public.events
      ADD COLUMN IF NOT EXISTS created_by TEXT,
      ADD COLUMN IF NOT EXISTS created_by_email TEXT,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS deleted_by TEXT;

    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON public.events (deleted_at)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events (created_by)';
  END IF;
END
$$;

COMMIT;
