const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { testDatabaseConnection } = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { authenticateToken, requireAdmin } = require("./middleware/authMiddleware");
const File = require("./models/File");
const User = require("./models/User");

// Import routes
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const shareRoutes = require("./routes/shareRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health and Root checks
app.get("/", (req, res) => {
  res.json({
    name: "DocDrop API",
    version: "1.0.0",
    status: "Operational",
    endpoints: {
      auth: "/api/auth",
      files: "/api/files",
      shares: "/api/shares",
      orders: "/api/orders",
      payments: "/api/payments",
      notifications: "/api/notifications",
      health: "/api/health",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "DocDrop API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// Admin stats endpoint
app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await File.getAdminStats();
    const users = await User.listAll();
    res.json({ stats, users });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch admin statistics" });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 DocDrop server running on http://localhost:${PORT}`);
  await testDatabaseConnection();
});

module.exports = app;