// lib/initDb.ts
import pool from "./db";

let initialized = false;

export async function initDb() {
  if (initialized) return; // ✅ already ran once in this runtime

  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      location TEXT,
      school TEXT,
      degree TEXT,
      major TEXT,
      graduation_date DATE,
      gpa NUMERIC(3,2),
      skills TEXT[],
      interests TEXT[],
      bio TEXT,
      linkedin TEXT,
      github TEXT,
      portfolio TEXT,
      resume_url TEXT,
      profile_image TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      auth0_id VARCHAR PRIMARY KEY,
      email VARCHAR(255),
      role VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

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
      deleted_at TIMESTAMP,
      deleted_by TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE events
      ADD COLUMN IF NOT EXISTS created_by TEXT,
      ADD COLUMN IF NOT EXISTS created_by_email TEXT,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS deleted_by TEXT;
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_events_registration_link
    ON events (registration_link);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_date_time
    ON events (date, time);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_deleted_at
    ON events (deleted_at);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_created_by
    ON events (created_by);
  `);

  initialized = true; // ✅ mark as done
  console.log("✅ Database tables verified / initialized");
}
