const { pool } = require("../config/db");

class User {
  static async findByEmail(email) {
    const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    return res.rows[0];
  }

  static async findById(id) {
    const res = await pool.query(
      "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1",
      [id]
    );
    return res.rows[0];
  }

  static async create({ name, email, password, role = "user" }) {
    const res = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email.toLowerCase(), password, role]
    );
    return res.rows[0];
  }

  static async updateProfile(id, { name }) {
    const res = await pool.query(
      `UPDATE users
       SET name = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, id]
    );
    return res.rows[0];
  }

  static async updatePassword(id, hashedPassword) {
    await pool.query(
      `UPDATE users
       SET password = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [hashedPassword, id]
    );
  }

  static async listAll() {
    const res = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              COUNT(f.id) AS file_count,
              COALESCE(SUM(f.file_size), 0) AS total_storage
       FROM users u
       LEFT JOIN files f ON f.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    return res.rows;
  }
}

module.exports = User;
