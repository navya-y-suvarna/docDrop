const express = require("express");
const router = express.Router();
const shareController = require("../controllers/shareController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Public endpoints (no auth required)
router.get("/public/:token", shareController.getPublicShareInfo);
router.post("/public/:token/verify", shareController.verifySharePassword);
router.get("/public/:token/view", shareController.viewSharedFile);
router.get("/public/:token/download", shareController.downloadSharedFile);

// Authenticated user share management
router.get("/my-shares", authenticateToken, shareController.listUserShares);
router.delete("/:token", authenticateToken, shareController.revokeShare);
router.delete("/by-id/:id", authenticateToken, shareController.deleteShare);

module.exports = router;
