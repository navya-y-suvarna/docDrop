const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "DocDrop_JWT_ChangeThisLater";

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

const optionalToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [decoded.id]
    );
    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }
  } catch (err) {
    // Ignore invalid token in optional context
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Administrator access required" });
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalToken,
  requireAdmin,
  JWT_SECRET,
};
