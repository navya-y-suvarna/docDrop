const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const shareController = require("../controllers/shareController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// All base file routes require authentication
router.use(authenticateToken);

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/", fileController.listFiles);
router.get("/stats/summary", fileController.getFileStats);
router.get("/:id", fileController.getFileById);
router.get("/:id/view", fileController.viewFile);
router.get("/:id/download", fileController.downloadFile);
router.put("/:id", fileController.updateFile);
router.delete("/:id", fileController.deleteFile);

// Sharing endpoints scoped to a file
router.post("/:id/share", shareController.createShareLink);
router.get("/:id/shares", shareController.getFileShares);

module.exports = router;
