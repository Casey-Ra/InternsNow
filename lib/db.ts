import { Pool } from "pg";

// Use the environment variable that Vercel/Neon provides
// In production, this will be the Neon connection string
// In development, we can still use local database
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.PG_URI;

if (!connectionString) {
  throw new Error("Database connection string not found. Please set POSTGRES_URL, DATABASE_URL, or PG_URI environment variable.");
}

// If the connection string targets a remote host (Neon, Supabase, etc.) we must
// keep SSL enabled.  Forcing ssl:false breaks SCRAM authentication against those
// servers even when the connection string already carries sslmode=require.
const isRemote =
  !!connectionString &&
  !connectionString.includes('localhost') &&
  !connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});

export default pool;