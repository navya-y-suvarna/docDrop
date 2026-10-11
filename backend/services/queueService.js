const { pool } = require("../config/db");

class QueueService {
  /**
   * Get queue position and estimated wait time for an order
   */
  static async getQueueStatus(orderId) {
    const res = await pool.query(
      `SELECT id, order_number, status, created_at,
        (SELECT COUNT(*) FROM orders o2 
         WHERE o2.status IN ('pending', 'processing') 
           AND o2.created_at < o1.created_at) AS ahead_count
       FROM orders o1
       WHERE o1.id = $1`,
      [orderId]
    );

    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    const aheadCount = parseInt(row.ahead_count, 10);
    const estimatedMinutes = (aheadCount + 1) * 3; // ~3 mins per job

    return {
      orderId: row.id,
      orderNumber: row.order_number,
      status: row.status,
      aheadCount,
      estimatedWaitMinutes: estimatedMinutes,
    };
  }
}

module.exports = QueueService;
