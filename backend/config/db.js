const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err);
});

const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful");
    console.log("🕒 Database time:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

module.exports = {
  pool,
  testDatabaseConnection,
};