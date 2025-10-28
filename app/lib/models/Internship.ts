import pool from "../db";

export interface Internship {
  id: string; // UUID
  company_name: string;
  job_description: string;
  url: string;
  created_at: Date;
}

// Initialize table (simple convenience; consider migrations)
const init = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS internships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255) NOT NULL,
        job_description TEXT NOT NULL,
        url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    // Ensure URL uniqueness to prevent duplicate seed inserts in concurrent environments
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS internships_url_unique ON internships (url)
    `);
    console.log("Internships table initialized successfully");
  } catch (err) {
    console.error("Internships table init failed:", err);
  }
};

// Initialize the table when the module is loaded
init();

export const createInternship = async (
  company_name: string,
  job_description: string,
  url: string
): Promise<Internship> => {
  try {
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

    return existing.rows[0];
  } catch (err: any) {
    console.error("Error creating internship:", err);
    throw err;
  }
};

export const findInternshipById = async (id: string): Promise<Internship | null> => {
  const result = await pool.query(
    "SELECT id, company_name, job_description, url, created_at FROM internships WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
};

export const getAllInternships = async (): Promise<Internship[]> => {
  const result = await pool.query(
    "SELECT id, company_name, job_description, url, created_at FROM internships ORDER BY created_at DESC"
  );
  return result.rows;
};

export const findInternshipsByCompany = async (company_name: string): Promise<Internship[]> => {
  const result = await pool.query(
    "SELECT id, company_name, job_description, url, created_at FROM internships WHERE company_name ILIKE $1 ORDER BY created_at DESC",
    [`%${company_name}%`]
  );
  return result.rows;
};

export const updateInternship = async (
  id: string,
  company_name: string,
  job_description: string,
  url: string
): Promise<Internship | null> => {
  try {
    const result = await pool.query(
      `
      UPDATE internships 
      SET company_name = $2, job_description = $3, url = $4
      WHERE id = $1
      RETURNING id, company_name, job_description, url, created_at
      `,
      [id, company_name, job_description, url]
    );

    return result.rows[0] || null;
  } catch (err: any) {
    console.error("Error updating internship:", err);
    throw err;
  }
};

export const deleteInternship = async (id: string): Promise<boolean> => {
  try {
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