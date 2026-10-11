const Payment = require("../models/Payment");
const Order = require("../models/Order");
const crypto = require("crypto");

const processPayment = async (req, res) => {
  try {
    const { order_id, payment_method = "upi" } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied to this order" });
    }

    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const payment = await Payment.create({
      order_id: order.id,
      user_id: req.user.id,
      amount: order.total_price,
      currency: "INR",
      payment_method,
      transaction_id: transactionId,
      status: "completed",
    });

    res.json({
      message: "Payment processed successfully",
      payment,
    });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ error: "Failed to process payment" });
  }
};

const getReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const payments = await Payment.findByOrderId(orderId);

    res.json({
      order,
      payments,
    });
  } catch (err) {
    console.error("Receipt error:", err);
    res.status(500).json({ error: "Failed to retrieve receipt" });
  }
};

module.exports = {
  processPayment,
  getReceipt,
};
