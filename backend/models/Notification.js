const { pool } = require("../config/db");

class Notification {
  static async create({ user_id, title, message, type = "info", link = null }) {
    const res = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, title, message, type, link]
    );
    return res.rows[0];
  }

  static async listByUser(userId) {
    const res = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    return res.rows;
  }

  static async markAsRead(id, userId) {
    const res = await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return res.rows[0];
  }

  static async markAllAsRead(userId) {
    await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1`,
      [userId]
    );
  }

  static async getUnreadCount(userId) {
    const res = await pool.query(
      `SELECT COUNT(id) AS unread_count 
       FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(res.rows[0].unread_count, 10);
  }
}

module.exports = Notification;
