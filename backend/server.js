const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testDatabaseConnection } = require("./config/db");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to DocDrop API",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "DocDrop API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 DocDrop server running on http://localhost:${PORT}`);

  await testDatabaseConnection();
});