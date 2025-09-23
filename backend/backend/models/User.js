// models/User.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// Initialize table (simple convenience; consider migrations)
const init = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`);
};
init().catch((err) => console.error("Users table init failed:", err));

const createUser = async (username, plainPassword) => {
  try {
    const result = await pool.query(
      `INSERT INTO users (username, password) VALUES ($1, $2)
       RETURNING id, username`,
      [username, plainPassword],
    );
    return result.rows[0]; // safe: does not include password
  } catch (err) {
    if (err.code === "23505") throw new Error("Username already exists");
    throw err;
  }
};

const findUserByUsername = async (username) => {
  const result = await pool.query(
    "SELECT id, username, password FROM users WHERE username = $1",
    [username],
  );
  return result.rows[0] || null;
};

module.exports = { createUser, findUserByUsername };
