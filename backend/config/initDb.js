const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { pool } = require("./db");
require("dotenv").config();

async function initDb() {
  try {
    console.log("🔄 Initializing DocDrop database schema...");
    const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(schemaSql);
    console.log("✅ Tables and indexes created successfully");

    // Check if admin user exists, if not seed
    const adminCheck = await pool.query("SELECT id FROM users WHERE email = $1", ["admin@docdrop.com"]);
    if (adminCheck.rows.length === 0) {
      const hashedAdminPassword = await bcrypt.hash("Admin@123", 10);
      await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)`,
        ["DocDrop Admin", "admin@docdrop.com", hashedAdminPassword, "admin"]
      );
      console.log("✅ Seeded default admin: admin@docdrop.com (Admin@123)");
    }

    // Check if demo user exists, if not seed
    const demoCheck = await pool.query("SELECT id FROM users WHERE email = $1", ["demo@docdrop.com"]);
    if (demoCheck.rows.length === 0) {
      const hashedDemoPassword = await bcrypt.hash("Demo@123", 10);
      const demoUser = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ["Alex Morgan", "demo@docdrop.com", hashedDemoPassword, "user"]
      );
      console.log("✅ Seeded default demo user: demo@docdrop.com (Demo@123)");

      // Create a welcome notification for demo user
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4)`,
        [
          demoUser.rows[0].id,
          "Welcome to DocDrop!",
          "Upload your documents, generate secure share links, or send documents to the smart print queue anytime.",
          "info",
        ]
      );
    }

    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
    throw err;
  }
}

if (require.main === module) {
  initDb()
    .then(() => {
      console.log("🏁 Database setup complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { initDb };
