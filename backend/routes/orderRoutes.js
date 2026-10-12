const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

// All order endpoints require authentication
router.use(authenticateToken);

// User endpoints
router.post("/", orderController.createOrder);
router.post("/quote", orderController.calculateQuote);
router.get("/", orderController.listUserOrders);
router.get("/:id", orderController.getOrderDetails);

// Admin endpoints
router.get("/admin/queue", requireAdmin, orderController.listQueue);
router.put("/admin/:id/status", requireAdmin, orderController.updateOrderStatus);
router.get("/admin/:id/file", requireAdmin, orderController.downloadOrderFile);
router.post("/admin/verify-pickup", requireAdmin, orderController.verifyPickup);

module.exports = router;
