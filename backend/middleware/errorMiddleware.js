const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  console.error("❌ Application Error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      const maxMb = process.env.MAX_FILE_SIZE_MB || "25";
      return res.status(400).json({
        error: `File size exceeds the allowed limit of ${maxMb}MB`,
      });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err.message && err.message.includes("not allowed for upload")) {
    return res.status(400).json({ error: err.message });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || "Internal server error occurred",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
};

module.exports = {
  errorHandler,
  notFound,
};
