const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.PG_URI,
});

pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL successfully ✅");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection error:", err.message);
    process.exit(1);
  });
