import { Pool } from "pg";

// Use the environment variable that Vercel/Neon provides
// In production, this will be the Neon connection string
// In development, we can still use local database
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.PG_URI;

if (!connectionString) {
  throw new Error("Database connection string not found. Please set POSTGRES_URL, DATABASE_URL, or PG_URI environment variable.");
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;