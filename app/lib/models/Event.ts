import { randomUUID } from "crypto";
import pool from "../db";

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  details: string;
  host: string;
  price: string;
  registration_link: string;
  tags: string[];
  created_by: string | null;
  created_by_email: string | null;
  deleted_at: Date | null;
  deleted_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface EventInput {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  details: string;
  host: string;
  price: string;
  registrationLink: string;
  tags: string[];
}

export interface EventView {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  details: string;
  host: string;
  price: string;
  registrationLink: string;
  tags: string[];
  createdBy: string | null;
  createdByEmail: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

let schemaEnsured = false;

async function ensureEventSchema() {
  if (schemaEnsured) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
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
      created_by TEXT,
      created_by_email TEXT,
      deleted_at TIMESTAMP WITH TIME ZONE,
      deleted_by TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE events
      ADD COLUMN IF NOT EXISTS created_by TEXT,
      ADD COLUMN IF NOT EXISTS created_by_email TEXT,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS deleted_by TEXT
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_deleted_at
    ON events (deleted_at)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_created_by
    ON events (created_by)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_date_time
    ON events (date, time)
  `);

  schemaEnsured = true;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(String(value ?? ""));
  if (Number.isNaN(parsed.getTime())) {
    return new Date(0);
  }

  return parsed;
}

function toNullableDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function normalizeTags(tags: string[]): string[] {
  const cleaned = tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 15);
  return Array.from(new Set(cleaned));
}

function mapEventRow(row: Record<string, unknown>): EventRecord {
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    date: String(row.date ?? ""),
    time: String(row.time ?? ""),
    location: String(row.location ?? ""),
    description: String(row.description ?? ""),
    details: String(row.details ?? ""),
    host: String(row.host ?? ""),
    price: String(row.price ?? ""),
    registration_link: String(row.registration_link ?? ""),
    tags: Array.isArray(row.tags)
      ? row.tags.map((tag) => String(tag))
      : [],
    created_by:
      typeof row.created_by === "string" ? row.created_by : null,
    created_by_email:
      typeof row.created_by_email === "string"
        ? row.created_by_email
        : null,
    deleted_at: toNullableDate(row.deleted_at),
    deleted_by:
      typeof row.deleted_by === "string" ? row.deleted_by : null,
    created_at: toDate(row.created_at),
    updated_at: toDate(row.updated_at),
  };
}

function toIso(value: Date | null): string | null {
  if (!value) {
    return null;
  }
  return value.toISOString();
}

export function toEventView(event: EventRecord): EventView {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    description: event.description,
    details: event.details,
    host: event.host,
    price: event.price,
    registrationLink: event.registration_link,
    tags: [...event.tags],
    createdBy: event.created_by,
    createdByEmail: event.created_by_email,
    deletedAt: toIso(event.deleted_at),
    deletedBy: event.deleted_by,
    createdAt: event.created_at.toISOString(),
    updatedAt: event.updated_at.toISOString(),
  };
}

const baseSelect = `
  SELECT
    id,
    title,
    date,
    time,
    location,
    description,
    details,
    host,
    price,
    registration_link,
    tags,
    created_by,
    created_by_email,
    deleted_at,
    deleted_by,
    created_at,
    updated_at
  FROM events
`;

export async function getEvents(options?: {
  includeDeleted?: boolean;
}): Promise<EventRecord[]> {
  await ensureEventSchema();
  const includeDeleted = Boolean(options?.includeDeleted);
  const whereClause = includeDeleted ? "" : "WHERE deleted_at IS NULL";
  const result = await pool.query(
    `${baseSelect} ${whereClause} ORDER BY created_at DESC`,
  );
  return result.rows.map((row) =>
    mapEventRow(row as Record<string, unknown>),
  );
}

export async function getEventById(
  id: string,
  options?: { includeDeleted?: boolean },
): Promise<EventRecord | null> {
  await ensureEventSchema();
  const includeDeleted = Boolean(options?.includeDeleted);
  const whereClause = includeDeleted
    ? "WHERE id = $1"
    : "WHERE id = $1 AND deleted_at IS NULL";
  const result = await pool.query(`${baseSelect} ${whereClause} LIMIT 1`, [
    id,
  ]);

  if (!result.rows[0]) {
    return null;
  }

  return mapEventRow(result.rows[0] as Record<string, unknown>);
}

export async function createEvent(
  input: EventInput,
  createdBy: { sub: string; email?: string | null },
): Promise<EventRecord> {
  await ensureEventSchema();
  const id = `evt-${randomUUID()}`;
  const tags = normalizeTags(input.tags);

  const result = await pool.query(
    `
    INSERT INTO events (
      id,
      title,
      date,
      time,
      location,
      description,
      details,
      host,
      price,
      registration_link,
      tags,
      created_by,
      created_by_email
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13
    )
    RETURNING
      id,
      title,
      date,
      time,
      location,
      description,
      details,
      host,
      price,
      registration_link,
      tags,
      created_by,
      created_by_email,
      deleted_at,
      deleted_by,
      created_at,
      updated_at
    `,
    [
      id,
      input.title,
      input.date,
      input.time,
      input.location,
      input.description,
      input.details,
      input.host,
      input.price,
      input.registrationLink,
      tags,
      createdBy.sub,
      createdBy.email ?? null,
    ],
  );

  return mapEventRow(result.rows[0] as Record<string, unknown>);
}

export async function updateEvent(
  id: string,
  input: EventInput,
): Promise<EventRecord | null> {
  await ensureEventSchema();
  const tags = normalizeTags(input.tags);
  const result = await pool.query(
    `
    UPDATE events
    SET
      title = $2,
      date = $3,
      time = $4,
      location = $5,
      description = $6,
      details = $7,
      host = $8,
      price = $9,
      registration_link = $10,
      tags = $11,
      updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING
      id,
      title,
      date,
      time,
      location,
      description,
      details,
      host,
      price,
      registration_link,
      tags,
      created_by,
      created_by_email,
      deleted_at,
      deleted_by,
      created_at,
      updated_at
    `,
    [
      id,
      input.title,
      input.date,
      input.time,
      input.location,
      input.description,
      input.details,
      input.host,
      input.price,
      input.registrationLink,
      tags,
    ],
  );

  if (!result.rows[0]) {
    return null;
  }

  return mapEventRow(result.rows[0] as Record<string, unknown>);
}

export async function softDeleteEvent(
  id: string,
  deletedBy: string,
): Promise<EventRecord | null> {
  await ensureEventSchema();
  const result = await pool.query(
    `
    UPDATE events
    SET
      deleted_at = NOW(),
      deleted_by = $2,
      updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING
      id,
      title,
      date,
      time,
      location,
      description,
      details,
      host,
      price,
      registration_link,
      tags,
      created_by,
      created_by_email,
      deleted_at,
      deleted_by,
      created_at,
      updated_at
    `,
    [id, deletedBy],
  );

  if (!result.rows[0]) {
    return null;
  }

  return mapEventRow(result.rows[0] as Record<string, unknown>);
}
