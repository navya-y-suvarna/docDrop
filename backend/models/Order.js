const { pool } = require("../config/db");

class Order {
  static async create({
    order_number,
    user_id,
    file_id,
    copies = 1,
    color_mode = "bw",
    paper_size = "A4",
    double_sided = false,
    binding_type = "none",
    notes = "",
    total_pages = 1,
    total_price = 0.0,
    status = "pending",
    pickup_time = null,
    pickup_code,
    pickup_qr = null,
  }) {
    const res = await pool.query(
      `INSERT INTO orders (
        order_number, user_id, file_id, copies, color_mode,
        paper_size, double_sided, binding_type, notes,
        total_pages, total_price, status, pickup_time, pickup_code, pickup_qr
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        order_number,
        user_id,
        file_id,
        copies,
        color_mode,
        paper_size,
        double_sided,
        binding_type,
        notes,
        total_pages,
        total_price,
        status,
        pickup_time,
        pickup_code,
        pickup_qr,
      ]
    );
    return res.rows[0];
  }

  static async findById(id) {
    const res = await pool.query(
      `SELECT o.*, 
              u.name AS user_name, u.email AS user_email,
              f.original_name, f.stored_filename, f.file_path, f.file_size, f.mime_type
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN files f ON f.id = o.file_id
       WHERE o.id = $1`,
      [id]
    );
    return res.rows[0];
  }

  static async findByOrderNumber(orderNumber) {
    const res = await pool.query(
      `SELECT o.*, 
              u.name AS user_name, u.email AS user_email,
              f.original_name, f.stored_filename, f.file_path, f.file_size, f.mime_type
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN files f ON f.id = o.file_id
       WHERE o.order_number = $1`,
      [orderNumber]
    );
    return res.rows[0];
  }

  static async listByUser(userId) {
    const res = await pool.query(
      `SELECT o.*, 
              f.original_name, f.file_size, f.mime_type
       FROM orders o
       LEFT JOIN files f ON f.id = o.file_id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return res.rows;
  }

  static async listAll({ status = "", search = "" } = {}) {
    let query = `
      SELECT o.*, 
             u.name AS user_name, u.email AS user_email,
             f.original_name, f.file_size, f.mime_type
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN files f ON f.id = o.file_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "all") {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    if (search && search.trim() !== "") {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(o.order_number) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length} OR LOWER(o.pickup_code) LIKE $${params.length})`;
    }

    query += ` ORDER BY 
      CASE 
        WHEN o.status = 'pending' THEN 1 
        WHEN o.status = 'processing' THEN 2 
        WHEN o.status = 'ready_for_pickup' THEN 3 
        ELSE 4 
      END,
      o.created_at DESC`;

    const res = await pool.query(query, params);
    return res.rows;
  }

  static async updateStatus(id, status) {
    const res = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  }

  static async verifyPickupCode(code) {
    const res = await pool.query(
      `SELECT o.*, u.name as user_name, f.original_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN files f ON f.id = o.file_id
       WHERE LOWER(o.pickup_code) = LOWER($1) OR o.order_number = $1`,
      [code.trim()]
    );
    return res.rows[0];
  }
}

module.exports = Order;
