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
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_events_registration_link
    ON events (registration_link);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_date_time
    ON events (date, time);
  `);

  initialized = true; // ✅ mark as done
  console.log("✅ Database tables verified / initialized");
}
