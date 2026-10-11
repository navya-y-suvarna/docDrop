const { pool } = require("../config/db");

class Payment {
  static async create({
    order_id,
    user_id,
    amount,
    currency = "INR",
    payment_method = "upi",
    transaction_id,
    status = "completed",
  }) {
    const res = await pool.query(
      `INSERT INTO payments (
        order_id, user_id, amount, currency, payment_method,
        transaction_id, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        order_id,
        user_id,
        amount,
        currency,
        payment_method,
        transaction_id,
        status,
      ]
    );
    return res.rows[0];
  }

  static async findByOrderId(orderId) {
    const res = await pool.query(
      `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC`,
      [orderId]
    );
    return res.rows[0];
  }

  static async listByUser(userId) {
    const res = await pool.query(
      `SELECT p.*, o.order_number 
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return res.rows;
  }
}

module.exports = Payment;
