import pool from "../db";

export interface Internship {
  id: string; // UUID
  company_name: string;
  job_description: string;
  url: string;
  created_at: Date;
}

export type InternshipSyncStatus = "created" | "updated" | "unchanged";

let schemaEnsured = false;

async function ensureInternshipSchema() {
  if (schemaEnsured) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS internships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_name VARCHAR(255) NOT NULL,
      job_description TEXT NOT NULL,
      url VARCHAR(500) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS internships_url_unique ON internships (url)
  `);

  schemaEnsured = true;
}

function mapInternshipRow(row: Record<string, unknown>): Internship {
  return {
    id: String(row.id ?? ""),
    company_name: String(row.company_name ?? ""),
    job_description: String(row.job_description ?? ""),
    url: String(row.url ?? ""),
    created_at:
      row.created_at instanceof Date
        ? row.created_at
        : new Date(String(row.created_at ?? "")),
  };
}

export const createInternship = async (
  company_name: string,
  job_description: string,
  url: string
): Promise<Internship> => {
  try {
    await ensureInternshipSchema();

    // Try inserting; if a row with the same URL already exists, avoid duplicate.
    const result = await pool.query(
      `
      INSERT INTO internships (company_name, job_description, url)
      VALUES ($1, $2, $3)
      ON CONFLICT (url) DO NOTHING
      RETURNING id, company_name, job_description, url, created_at
      `,
      [company_name, job_description, url]
    );

    if (result.rows[0]) return result.rows[0];

    // If insertion was skipped due to conflict, return the existing row
    const existing = await pool.query(
      `SELECT id, company_name, job_description, url, created_at FROM internships WHERE url = $1 LIMIT 1`,
      [url]
    );

    return mapInternshipRow(existing.rows[0] as Record<string, unknown>);
  } catch (err: any) {
    console.error("Error creating internship:", err);
    throw err;
  }
};

export const findInternshipById = async (id: string): Promise<Internship | null> => {
  try {
    await ensureInternshipSchema();
    const result = await pool.query(
      "SELECT id, company_name, job_description, url, created_at FROM internships WHERE id = $1",
      [id]
    );
    return result.rows[0]
      ? mapInternshipRow(result.rows[0] as Record<string, unknown>)
      : null;
  } catch (err) {
    console.error("Error fetching internship by id:", err);
    return null;
  }
};

export const getAllInternships = async (): Promise<Internship[]> => {
  try {
    await ensureInternshipSchema();
    const result = await pool.query(
      "SELECT id, company_name, job_description, url, created_at FROM internships ORDER BY created_at DESC"
    );
    return result.rows.map((row) =>
      mapInternshipRow(row as Record<string, unknown>)
    );
  } catch (err: any) {
    console.error("Error fetching internships:", err);
    return [];
  }
};

export const findInternshipsByCompany = async (company_name: string): Promise<Internship[]> => {
  await ensureInternshipSchema();
  const result = await pool.query(
    "SELECT id, company_name, job_description, url, created_at FROM internships WHERE company_name ILIKE $1 ORDER BY created_at DESC",
    [`%${company_name}%`]
  );
  return result.rows.map((row) =>
    mapInternshipRow(row as Record<string, unknown>)
  );
};

export const updateInternship = async (
  id: string,
  company_name: string,
  job_description: string,
  url: string
): Promise<Internship | null> => {
  try {
    await ensureInternshipSchema();
    const result = await pool.query(
      `
      UPDATE internships 
      SET company_name = $2, job_description = $3, url = $4
      WHERE id = $1
      RETURNING id, company_name, job_description, url, created_at
      `,
      [id, company_name, job_description, url]
    );

    return result.rows[0]
      ? mapInternshipRow(result.rows[0] as Record<string, unknown>)
      : null;
  } catch (err: any) {
    console.error("Error updating internship:", err);
    throw err;
  }
};

export const syncInternshipByUrl = async (
  company_name: string,
  job_description: string,
  url: string
): Promise<{ status: InternshipSyncStatus; internship: Internship }> => {
  await ensureInternshipSchema();

  const existing = await pool.query(
    `
    SELECT id, company_name, job_description, url, created_at
    FROM internships
    WHERE url = $1
    LIMIT 1
    `,
    [url]
  );

  if (!existing.rows[0]) {
    const created = await pool.query(
      `
      INSERT INTO internships (company_name, job_description, url)
      VALUES ($1, $2, $3)
      RETURNING id, company_name, job_description, url, created_at
      `,
      [company_name, job_description, url]
    );

    return {
      status: "created",
      internship: mapInternshipRow(created.rows[0] as Record<string, unknown>),
    };
  }

  const current = mapInternshipRow(existing.rows[0] as Record<string, unknown>);
  if (
    current.company_name === company_name &&
    current.job_description === job_description
  ) {
    return { status: "unchanged", internship: current };
  }

  const updated = await pool.query(
    `
    UPDATE internships
    SET company_name = $2, job_description = $3
    WHERE url = $1
    RETURNING id, company_name, job_description, url, created_at
    `,
    [url, company_name, job_description]
  );

  return {
    status: "updated",
    internship: mapInternshipRow(updated.rows[0] as Record<string, unknown>),
  };
};

export const deleteInternship = async (id: string): Promise<boolean> => {
  try {
    await ensureInternshipSchema();
    const result = await pool.query(
      "DELETE FROM internships WHERE id = $1",
      [id]
    );

    // Log rowCount to aid debugging if deletions fail
    console.log(`deleteInternship: deleted rows for id ${id}:`, result.rowCount);
    return result.rowCount! > 0;
  } catch (err: any) {
    console.error("Error deleting internship:", err);
    throw err;
  }
};

export const deleteInternshipByUrl = async (url: string): Promise<number> => {
  try {
    await ensureInternshipSchema();
    const result = await pool.query(
      "DELETE FROM internships WHERE url = $1",
      [url]
    );
  console.log(`deleteInternshipByUrl: deleted rows for url ${url}:`, result.rowCount);
  return result.rowCount ?? 0;
  } catch (err: any) {
    console.error("Error deleting internship by url:", err);
    throw err;
  }
};
