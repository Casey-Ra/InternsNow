/**
 * Automatic migration runner.
 *
 * Tracks which migration files have already been applied in a
 * `_migrations` table so each file runs at most once.
 *
 * Usage:  npx tsx db/migrate.ts
 * Called automatically during `npm run build` via the "prebuild" script.
 */

import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.PG_URI;

if (!connectionString) {
  console.log("⚠  No database connection string found — skipping migrations.");
  process.exit(0);
}

const isRemote =
  !connectionString.includes("localhost") &&
  !connectionString.includes("127.0.0.1");

const pool = new Pool({
  connectionString,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});

async function run() {
  const client = await pool.connect();
  try {
    // Ensure tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Get already-applied migrations
    const applied = new Set(
      (await client.query("SELECT name FROM _migrations")).rows.map(
        (r: { name: string }) => r.name
      )
    );

    // Read migration files sorted by name (date prefix ensures order)
    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  ✓ ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      console.log(`  ▶ ${file} …`);

      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING",
          [file]
        );
        console.log(`  ✓ ${file} applied`);
        ran++;
      } catch (err) {
        console.error(`  ✗ ${file} FAILED:`, err);
        process.exit(1);
      }
    }

    console.log(
      ran > 0
        ? `\n  ${ran} migration(s) applied.`
        : "\n  All migrations up to date."
    );
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Migration runner error:", err);
  process.exit(1);
});
