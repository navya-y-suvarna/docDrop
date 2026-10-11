const { pool } = require("../config/db");

class File {
  static async create({
    user_id,
    original_name,
    stored_filename,
    file_path,
    mime_type,
    file_size,
    category,
    tags = [],
    description = "",
  }) {
    const res = await pool.query(
      `INSERT INTO files (
        user_id, original_name, stored_filename, file_path,
        mime_type, file_size, category, tags, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        user_id,
        original_name,
        stored_filename,
        file_path,
        mime_type,
        file_size,
        category,
        tags,
        description,
      ]
    );
    return res.rows[0];
  }

  static async findById(id) {
    const res = await pool.query(
      `SELECT f.*, u.name as owner_name, u.email as owner_email
       FROM files f
       JOIN users u ON u.id = f.user_id
       WHERE f.id = $1`,
      [id]
    );
    return res.rows[0];
  }

  static async findByIdAndUser(id, userId) {
    const res = await pool.query(
      `SELECT * FROM files WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.rows[0];
  }

  static async listByUser(userId, { search = "", category = "", sort = "newest" } = {}) {
    let query = `
      SELECT f.*, 
        COUNT(sl.id) AS active_share_count
      FROM files f
      LEFT JOIN shared_links sl ON sl.file_id = f.id AND sl.is_revoked = false
      WHERE f.user_id = $1
    `;
    const params = [userId];

    if (search && search.trim() !== "") {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(f.original_name) LIKE $${params.length} OR LOWER(COALESCE(f.description, '')) LIKE $${params.length})`;
    }

    if (category && category !== "all") {
      params.push(category);
      query += ` AND f.category = $${params.length}`;
    }

    query += ` GROUP BY f.id`;

    switch (sort) {
      case "oldest":
        query += ` ORDER BY f.created_at ASC`;
        break;
      case "name_asc":
        query += ` ORDER BY LOWER(f.original_name) ASC`;
        break;
      case "name_desc":
        query += ` ORDER BY LOWER(f.original_name) DESC`;
        break;
      case "size_asc":
        query += ` ORDER BY f.file_size ASC`;
        break;
      case "size_desc":
        query += ` ORDER BY f.file_size DESC`;
        break;
      case "newest":
      default:
        query += ` ORDER BY f.created_at DESC`;
        break;
    }

    const res = await pool.query(query, params);
    return res.rows;
  }

  static async update(id, userId, { tags, description, is_public }) {
    const res = await pool.query(
      `UPDATE files
       SET tags = COALESCE($1, tags),
           description = COALESCE($2, description),
           is_public = COALESCE($3, is_public),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [tags, description, is_public, id, userId]
    );
    return res.rows[0];
  }

  static async delete(id, userId) {
    const res = await pool.query(
      `DELETE FROM files WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return res.rows[0];
  }

  static async getStatsByUser(userId) {
    const totalRes = await pool.query(
      `SELECT 
        COUNT(id) AS total_files,
        COALESCE(SUM(file_size), 0) AS total_storage_bytes
       FROM files
       WHERE user_id = $1`,
      [userId]
    );

    const catRes = await pool.query(
      `SELECT category, COUNT(id) AS count, COALESCE(SUM(file_size), 0) as total_size
       FROM files
       WHERE user_id = $1
       GROUP BY category`,
      [userId]
    );

    const sharesRes = await pool.query(
      `SELECT COUNT(id) AS active_shares
       FROM shared_links
       WHERE user_id = $1 AND is_revoked = false`,
      [userId]
    );

    return {
      totalFiles: parseInt(totalRes.rows[0].total_files, 10),
      totalStorageBytes: parseInt(totalRes.rows[0].total_storage_bytes, 10),
      categories: catRes.rows,
      activeShares: parseInt(sharesRes.rows[0].active_shares, 10),
    };
  }

  static async getAdminStats() {
    const summaryRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM files) AS total_files,
        (SELECT COALESCE(SUM(file_size), 0) FROM files) AS total_storage_bytes,
        (SELECT COUNT(*) FROM shared_links WHERE is_revoked = false) AS active_shares,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status != 'cancelled') AS total_revenue
    `);

    return summaryRes.rows[0];
  }
}

module.exports = File;
