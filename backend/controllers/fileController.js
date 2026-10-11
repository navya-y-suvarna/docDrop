const fs = require("fs");
const path = require("path");
const File = require("../models/File");
const { categorizeFile } = require("../middleware/uploadMiddleware");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded" });
    }

    const { description } = req.body;
    let tags = [];
    if (req.body.tags) {
      try {
        tags = Array.isArray(req.body.tags)
          ? req.body.tags
          : typeof req.body.tags === "string"
          ? JSON.parse(req.body.tags)
          : [];
      } catch (e) {
        tags = req.body.tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const category = categorizeFile(req.file.mimetype, req.file.originalname);

    const newFile = await File.create({
      user_id: req.user.id,
      original_name: req.file.originalname,
      stored_filename: req.file.filename,
      file_path: req.file.path,
      mime_type: req.file.mimetype || "application/octet-stream",
      file_size: req.file.size,
      category,
      tags,
      description: description || "",
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to process uploaded file" });
  }
};

const listFiles = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const files = await File.listByUser(req.user.id, { search, category, sort });
    res.json({ files });
  } catch (err) {
    console.error("List files error:", err);
    res.status(500).json({ error: "Failed to retrieve documents" });
  }
};

const getFileById = async (req, res) => {
  try {
    const file = await File.findByIdAndUser(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: "File not found or access denied" });
    }
    res.json({ file });
  } catch (err) {
    console.error("Get file error:", err);
    res.status(500).json({ error: "Failed to retrieve document details" });
  }
};

const viewFile = async (req, res) => {
  try {
    const file = await File.findByIdAndUser(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: "File not found or access denied" });
    }

    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: "Stored file missing on disk" });
    }

    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.original_name)}"`);
    const stream = fs.createReadStream(file.file_path);
    stream.pipe(res);
  } catch (err) {
    console.error("View file error:", err);
    res.status(500).json({ error: "Failed to stream file for preview" });
  }
};

const downloadFile = async (req, res) => {
  try {
    const file = await File.findByIdAndUser(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: "File not found or access denied" });
    }

    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: "Stored file missing on disk" });
    }

    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.original_name)}"`);
    const stream = fs.createReadStream(file.file_path);
    stream.pipe(res);
  } catch (err) {
    console.error("Download file error:", err);
    res.status(500).json({ error: "Failed to download file" });
  }
};

const updateFile = async (req, res) => {
  try {
    const { tags, description, is_public } = req.body;
    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const updated = await File.update(req.params.id, req.user.id, {
      tags: parsedTags,
      description,
      is_public,
    });

    if (!updated) {
      return res.status(404).json({ error: "File not found or access denied" });
    }

    res.json({ message: "File updated successfully", file: updated });
  } catch (err) {
    console.error("Update file error:", err);
    res.status(500).json({ error: "Failed to update document metadata" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const deleted = await File.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: "File not found or access denied" });
    }

    // Attempt to remove physical file from disk
    if (fs.existsSync(deleted.file_path)) {
      fs.unlink(deleted.file_path, (err) => {
        if (err) console.error("Error removing file from disk:", err);
      });
    }

    res.json({ message: "File deleted successfully", fileId: deleted.id });
  } catch (err) {
    console.error("Delete file error:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

const getFileStats = async (req, res) => {
  try {
    const stats = await File.getStatsByUser(req.user.id);
    res.json({ stats });
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({ error: "Failed to retrieve storage statistics" });
  }
};

module.exports = {
  uploadFile,
  listFiles,
  getFileById,
  viewFile,
  downloadFile,
  updateFile,
  deleteFile,
  getFileStats,
};
