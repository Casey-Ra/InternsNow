import pool from "../db";

export interface User {
  auth0_id: number;
  email?: string;
  role: string;
  created_at: Date;
}

export const createUser = async (
  auth0_id: string,
  email?: string,
  role: string = "student",
): Promise<User> => {
  try {
    const result = await pool.query(
      `
      INSERT INTO users (auth0_id, email, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (auth0_id) DO UPDATE
        SET email = EXCLUDED.email,
            role = EXCLUDED.role
      RETURNING auth0_id, email, role, created_at
      `,
      [auth0_id, email, role],
    );

    return result.rows[0];
  } catch (err: any) {
    console.error("Error creating user:", err);
    throw err;
  }
};

export const findUserByAuth0Id = async (
  auth0_id: string,
): Promise<User | null> => {
  const result = await pool.query(
    "SELECT auth0_id, email, role, created_at FROM users WHERE auth0_id = $1",
    [auth0_id],
  );
  return result.rows[0] || null;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(
    "SELECT auth0_id, email, role, created_at FROM users WHERE email = $1",
    [email],
  );
  return result.rows[0] || null;
};
