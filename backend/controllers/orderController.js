const fs = require("fs");
const Order = require("../models/Order");
const File = require("../models/File");
const Notification = require("../models/Notification");
const { generateOrderId, generatePickupCode } = require("../utils/generateOrderId");
const { generateQR } = require("../utils/generateQR");

// Price calculation helper
const calculatePrice = ({ copies = 1, color_mode = "bw", paper_size = "A4", double_sided = false, binding_type = "none", total_pages = 1 }) => {
  const numCopies = Math.max(1, parseInt(copies, 10) || 1);
  const numPages = Math.max(1, parseInt(total_pages, 10) || 1);

  // Base rate per page
  let ratePerPage = color_mode === "color" ? 10.0 : 2.0;

  if (paper_size === "A3") {
    ratePerPage *= 1.8;
  }

  if (double_sided) {
    // 15% discount for duplex printing
    ratePerPage *= 0.85;
  }

  let printCost = numPages * ratePerPage * numCopies;

  // Binding cost
  let bindingCost = 0;
  if (binding_type === "staple") bindingCost = 5.0 * numCopies;
  if (binding_type === "spiral") bindingCost = 35.0 * numCopies;

  const total = printCost + bindingCost;
  return parseFloat(total.toFixed(2));
};

const createOrder = async (req, res) => {
  try {
    const {
      file_id,
      copies = 1,
      color_mode = "bw",
      paper_size = "A4",
      double_sided = false,
      binding_type = "none",
      notes = "",
      total_pages = 1,
      pickup_time,
    } = req.body;

    if (!file_id) {
      return res.status(400).json({ error: "Document is required to place an order" });
    }

    const file = await File.findByIdAndUser(file_id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: "Selected document not found" });
    }

    const totalPrice = calculatePrice({
      copies,
      color_mode,
      paper_size,
      double_sided,
      binding_type,
      total_pages,
    });

    const orderNumber = generateOrderId();
    const pickupCode = generatePickupCode();

    // Generate QR payload containing verification token and order metadata
    const qrPayload = JSON.stringify({
      orderNumber,
      pickupCode,
      user: req.user.name,
      file: file.original_name,
    });
    const qrDataUrl = await generateQR(qrPayload);

    const order = await Order.create({
      order_number: orderNumber,
      user_id: req.user.id,
      file_id: file.id,
      copies: parseInt(copies, 10) || 1,
      color_mode,
      paper_size,
      double_sided: Boolean(double_sided),
      binding_type,
      notes: notes || "",
      total_pages: parseInt(total_pages, 10) || 1,
      total_price: totalPrice,
      status: "pending",
      pickup_time: pickup_time ? new Date(pickup_time) : null,
      pickup_code: pickupCode,
      pickup_qr: qrDataUrl,
    });

    // Notify user
    await Notification.create({
      user_id: req.user.id,
      title: "Print Order Placed",
      message: `Your print order ${orderNumber} for "${file.original_name}" has been placed and added to the queue. Pickup code: ${pickupCode}`,
      type: "order",
      link: `/orders/${order.id}`,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to place print order" });
  }
};

const calculateQuote = (req, res) => {
  try {
    const { copies, color_mode, paper_size, double_sided, binding_type, total_pages } = req.body;
    const price = calculatePrice({
      copies,
      color_mode,
      paper_size,
      double_sided,
      binding_type,
      total_pages,
    });
    res.json({ price });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate quote" });
  }
};

const listUserOrders = async (req, res) => {
  try {
    const orders = await Order.listByUser(req.user.id);
    res.json({ orders });
  } catch (err) {
    console.error("List user orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied to this order" });
    }

    res.json({ order });
  } catch (err) {
    console.error("Get order details error:", err);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
};

// Admin queue controllers
const listQueue = async (req, res) => {
  try {
    const { status, search } = req.query;
    const orders = await Order.listAll({ status, search });
    res.json({ orders });
  } catch (err) {
    console.error("List queue error:", err);
    res.status(500).json({ error: "Failed to fetch queue" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "ready_for_pickup", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid: ${validStatuses.join(", ")}` });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updated = await Order.updateStatus(id, status);

    // Notify user of status update
    let message = `Your order ${order.order_number} status is now: ${status.replace(/_/g, " ").toUpperCase()}`;
    if (status === "ready_for_pickup") {
      message = `🎉 Your print job ${order.order_number} is READY for pickup! Present your code ${order.pickup_code} at the counter.`;
    }

    await Notification.create({
      user_id: order.user_id,
      title: `Order Status: ${status.replace(/_/g, " ").toUpperCase()}`,
      message,
      type: status === "ready_for_pickup" ? "success" : "info",
      link: `/orders/${order.id}`,
    });

    res.json({ message: "Status updated successfully", order: updated });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

const verifyPickup = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Pickup code or order number is required" });
    }

    const order = await Order.verifyPickupCode(code);
    if (!order) {
      return res.status(404).json({ error: "No matching order found for this pickup code" });
    }

    res.json({
      verified: true,
      order,
    });
  } catch (err) {
    console.error("Verify pickup error:", err);
    res.status(500).json({ error: "Failed to verify pickup code" });
  }
};

// Admin: stream the document attached to an order so the shop can print it
const downloadOrderFile = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || !order.file_path) {
      return res.status(404).json({ error: "Order or document not found" });
    }
    if (!fs.existsSync(order.file_path)) {
      return res.status(404).json({ error: "Stored file missing on disk" });
    }
    res.setHeader("Content-Type", order.mime_type || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(order.original_name)}"`);
    fs.createReadStream(order.file_path).pipe(res);
  } catch (err) {
    console.error("Order file error:", err);
    res.status(500).json({ error: "Failed to stream order document" });
  }
};

module.exports = {
  downloadOrderFile,
  createOrder,
  calculateQuote,
  listUserOrders,
  getOrderDetails,
  listQueue,
  updateOrderStatus,
  verifyPickup,
};
