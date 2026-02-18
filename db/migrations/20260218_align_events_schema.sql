BEGIN;

-- Create target table if it does not exist.
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  details TEXT NOT NULL,
  host TEXT NOT NULL,
  price TEXT NOT NULL,
  registration_link TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Align existing table shape (if it already exists with older columns/types).
ALTER TABLE public.events
  ALTER COLUMN id TYPE TEXT USING id::text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS date TEXT,
  ADD COLUMN IF NOT EXISTS time TEXT,
  ADD COLUMN IF NOT EXISTS registration_link TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Backfill from old columns when present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'events'
      AND column_name = 'event_date'
  ) THEN
    EXECUTE $sql$
      UPDATE public.events
      SET date = COALESCE(date, TO_CHAR(event_date, 'Dy, Mon DD'))
      WHERE date IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'events'
      AND column_name = 'event_time'
  ) THEN
    EXECUTE $sql$
      UPDATE public.events
      SET time = COALESCE(time, event_time)
      WHERE time IS NULL
    $sql$;
  END IF;
END $$;

-- Ensure required fields are populated before NOT NULL constraints.
UPDATE public.events SET title = COALESCE(title, 'Untitled Event');
UPDATE public.events SET date = COALESCE(date, 'TBD');
UPDATE public.events SET time = COALESCE(time, 'TBD');
UPDATE public.events SET location = COALESCE(location, 'TBD');
UPDATE public.events SET description = COALESCE(description, '');
UPDATE public.events SET details = COALESCE(details, '');
UPDATE public.events SET host = COALESCE(host, 'TBD');
UPDATE public.events SET price = COALESCE(price, 'TBD');
UPDATE public.events
SET registration_link = COALESCE(
  registration_link,
  'https://example.com/events/' || id
);
UPDATE public.events SET tags = COALESCE(tags, '{}');

ALTER TABLE public.events
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN date SET NOT NULL,
  ALTER COLUMN time SET NOT NULL,
  ALTER COLUMN location SET NOT NULL,
  ALTER COLUMN description SET NOT NULL,
  ALTER COLUMN details SET NOT NULL,
  ALTER COLUMN host SET NOT NULL,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN registration_link SET NOT NULL,
  ALTER COLUMN tags SET NOT NULL,
  ALTER COLUMN tags SET DEFAULT '{}';

-- Make duplicate links unique so unique index can be created safely.
WITH ranked AS (
  SELECT
    id,
    registration_link,
    ROW_NUMBER() OVER (PARTITION BY registration_link ORDER BY id) AS rn
  FROM public.events
)
UPDATE public.events e
SET registration_link = e.registration_link || '#dup-' || ranked.rn::text
FROM ranked
WHERE e.id = ranked.id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_registration_link
  ON public.events (registration_link);

CREATE INDEX IF NOT EXISTS idx_events_date_time
  ON public.events (date, time);

-- Drop legacy columns if they still exist.
ALTER TABLE public.events
  DROP COLUMN IF EXISTS event_date,
  DROP COLUMN IF EXISTS event_time;

COMMIT;
