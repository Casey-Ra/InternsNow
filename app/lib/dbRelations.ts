import pool from "./db";

const relationExistsCache = new Map<string, boolean>();

export async function relationExists(relationName: string): Promise<boolean> {
  if (relationExistsCache.has(relationName)) {
    return relationExistsCache.get(relationName) ?? false;
  }

  const result = await pool.query<{ exists: boolean }>(
    "SELECT to_regclass($1) IS NOT NULL AS exists",
    [relationName],
  );

  const exists = Boolean(result.rows[0]?.exists);
  relationExistsCache.set(relationName, exists);
  return exists;
}
