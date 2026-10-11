const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Map extensions and mime types to categories
const categorizeFile = (mimeType, filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  if (mimeType.includes("pdf") || ext === ".pdf") return "pdf";
  if (mimeType.startsWith("image/") || [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"].includes(ext)) return "image";
  if (
    [".doc", ".docx", ".odt", ".rtf"].includes(ext) ||
    mimeType.includes("wordprocessingml") ||
    mimeType.includes("msword")
  ) return "document";
  if (
    [".xls", ".xlsx", ".csv", ".ods"].includes(ext) ||
    mimeType.includes("spreadsheetml") ||
    mimeType.includes("csv") ||
    mimeType.includes("excel")
  ) return "spreadsheet";
  if (
    [".ppt", ".pptx", ".odp"].includes(ext) ||
    mimeType.includes("presentationml") ||
    mimeType.includes("powerpoint")
  ) return "presentation";
  if (
    [".txt", ".md", ".json", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".py", ".java", ".c", ".cpp", ".sql", ".xml", ".yaml", ".yml"].includes(ext) ||
    mimeType.startsWith("text/")
  ) return "text";
  if ([".zip", ".tar", ".gz", ".7z", ".rar"].includes(ext)) return "archive";

  return "other";
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate safe unique filename
    const uniqueId = crypto.randomUUID();
    const cleanExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
    cb(null, `${uniqueId}${cleanExt}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Reject executables and dangerous file types
  const dangerousExts = [".exe", ".bat", ".cmd", ".sh", ".vbs", ".msi", ".dll", ".so", ".bin"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (dangerousExts.includes(ext)) {
    return cb(new Error("Executable or binary scripts are not allowed for upload"), false);
  }
  cb(null, true);
};

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || "25", 10);

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024,
  },
  fileFilter,
});

module.exports = {
  upload,
  categorizeFile,
  uploadDir,
};
