import pool from "../db";

export interface User {
  id: number;
  username: string;
  password?: string;
  created_at: Date;
}

// Initialize table (simple convenience; consider migrations)
const init = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);
    console.log("Users table initialized successfully");
  } catch (err) {
    console.error("Users table init failed:", err);
  }
};

// Initialize the table when the module is loaded
init();

export const createUser = async (username: string, hashedPassword: string): Promise<User> => {
  try {
    const result = await pool.query(
      `INSERT INTO users (username, password) VALUES ($1, $2)
       RETURNING id, username, created_at`,
      [username, hashedPassword]
    );
    return result.rows[0];
  } catch (err: any) {
    if (err.code === "23505") {
      throw new Error("Username already exists");
    }
    throw err;
  }
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const result = await pool.query(
    "SELECT id, username, password, created_at FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0] || null;
};