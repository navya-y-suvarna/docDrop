const { pool } = require("../config/db");
const crypto = require("crypto");

class SharedLink {
  static async create({
    file_id,
    user_id,
    password_hash = null,
    has_password = false,
    expires_at = null,
    max_downloads = null,
    allow_download = true,
  }) {
    // Generate secure 32-character hex token
    const share_token = crypto.randomBytes(16).toString("hex");

    const res = await pool.query(
      `INSERT INTO shared_links (
        file_id, user_id, share_token, password_hash, has_password,
        expires_at, max_downloads, allow_download
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        file_id,
        user_id,
        share_token,
        password_hash,
        has_password,
        expires_at,
        max_downloads,
        allow_download,
      ]
    );
    return res.rows[0];
  }

  static async findByToken(token) {
    const res = await pool.query(
      `SELECT sl.*, 
              f.original_name, f.stored_filename, f.file_path, f.mime_type, f.file_size, f.category, f.description,
              u.name AS owner_name, u.email AS owner_email
       FROM shared_links sl
       JOIN files f ON f.id = sl.file_id
       JOIN users u ON u.id = sl.user_id
       WHERE sl.share_token = $1`,
      [token]
    );
    return res.rows[0];
  }

  static async listByUserId(userId) {
    const res = await pool.query(
      `SELECT sl.*, 
              f.original_name, f.mime_type, f.file_size, f.category
       FROM shared_links sl
       JOIN files f ON f.id = sl.file_id
       WHERE sl.user_id = $1
       ORDER BY sl.created_at DESC`,
      [userId]
    );
    return res.rows;
  }

  static async listByFileId(fileId, userId) {
    const res = await pool.query(
      `SELECT * FROM shared_links 
       WHERE file_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [fileId, userId]
    );
    return res.rows;
  }

  static async revoke(token, userId) {
    const res = await pool.query(
      `UPDATE shared_links
       SET is_revoked = true
       WHERE share_token = $1 AND user_id = $2
       RETURNING *`,
      [token, userId]
    );
    return res.rows[0];
  }

  static async delete(id, userId) {
    const res = await pool.query(
      `DELETE FROM shared_links
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return res.rows[0];
  }

  static async incrementView(token) {
    await pool.query(
      `UPDATE shared_links
       SET view_count = view_count + 1
       WHERE share_token = $1`,
      [token]
    );
  }

  static async incrementDownload(token) {
    await pool.query(
      `UPDATE shared_links
       SET download_count = download_count + 1
       WHERE share_token = $1`,
      [token]
    );
  }

  static isAccessible(link) {
    if (!link) return { valid: false, reason: "Link not found" };
    if (link.is_revoked) return { valid: false, reason: "This share link has been revoked by the owner" };
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return { valid: false, reason: "This share link has expired" };
    }
    if (link.max_downloads !== null && link.download_count >= link.max_downloads) {
      return { valid: false, reason: "Download limit for this link has been reached" };
    }
    return { valid: true };
  }
}

module.exports = SharedLink;
