const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.post("/process", paymentController.processPayment);
router.get("/receipt/:orderId", paymentController.getReceipt);

module.exports = router;
