const Payment = require("../models/Payment");
const Order = require("../models/Order");
const crypto = require("crypto");

class PaymentService {
  /**
   * Process and record a transaction
   */
  static async processTransaction({ orderId, userId, amount, method = "upi" }) {
    const txnId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const payment = await Payment.create({
      order_id: orderId,
      user_id: userId,
      amount,
      currency: "INR",
      payment_method: method,
      transaction_id: txnId,
      status: "completed",
    });

    return payment;
  }
}

module.exports = PaymentService;
