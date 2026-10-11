const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SharedLink = require("../models/SharedLink");
const File = require("../models/File");
const { JWT_SECRET } = require("../middleware/authMiddleware");

const createShareLink = async (req, res) => {
  try {
    const fileId = req.params.id || req.body.file_id;
    const { password, expires_in_hours, max_downloads, allow_download } = req.body;

    const file = await File.findByIdAndUser(fileId, req.user.id);
    if (!file) {
      return res.status(404).json({ error: "File not found or access denied" });
    }

    let passwordHash = null;
    let hasPassword = false;
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
      hasPassword = true;
    }

    let expiresAt = null;
    if (expires_in_hours && Number(expires_in_hours) > 0) {
      expiresAt = new Date(Date.now() + Number(expires_in_hours) * 60 * 60 * 1000);
    }

    const share = await SharedLink.create({
      file_id: file.id,
      user_id: req.user.id,
      password_hash: passwordHash,
      has_password: hasPassword,
      expires_at: expiresAt,
      max_downloads: max_downloads ? parseInt(max_downloads, 10) : null,
      allow_download: allow_download !== undefined ? Boolean(allow_download) : true,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const shareUrl = `${clientUrl}/share/${share.share_token}`;

    res.status(201).json({
      message: "Share link created successfully",
      share: {
        ...share,
        share_url: shareUrl,
      },
    });
  } catch (err) {
    console.error("Create share error:", err);
    res.status(500).json({ error: "Failed to generate share link" });
  }
};

const getFileShares = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findByIdAndUser(fileId, req.user.id);
    if (!file) {
      return res.status(404).json({ error: "File not found or access denied" });
    }

    const shares = await SharedLink.listByFileId(fileId, req.user.id);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const formatted = shares.map((s) => ({
      ...s,
      share_url: `${clientUrl}/share/${s.share_token}`,
    }));

    res.json({ shares: formatted });
  } catch (err) {
    console.error("Get file shares error:", err);
    res.status(500).json({ error: "Failed to fetch file share links" });
  }
};

const listUserShares = async (req, res) => {
  try {
    const shares = await SharedLink.listByUserId(req.user.id);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const formatted = shares.map((s) => ({
      ...s,
      share_url: `${clientUrl}/share/${s.share_token}`,
    }));
    res.json({ shares: formatted });
  } catch (err) {
    console.error("List user shares error:", err);
    res.status(500).json({ error: "Failed to fetch shared links" });
  }
};

const revokeShare = async (req, res) => {
  try {
    const { token } = req.params;
    const revoked = await SharedLink.revoke(token, req.user.id);
    if (!revoked) {
      return res.status(404).json({ error: "Share link not found or access denied" });
    }
    res.json({ message: "Share link revoked successfully", share: revoked });
  } catch (err) {
    console.error("Revoke share error:", err);
    res.status(500).json({ error: "Failed to revoke share link" });
  }
};

const deleteShare = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SharedLink.delete(id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: "Share link not found or access denied" });
    }
    res.json({ message: "Share link deleted successfully" });
  } catch (err) {
    console.error("Delete share error:", err);
    res.status(500).json({ error: "Failed to delete share link" });
  }
};

const getPublicShareInfo = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await SharedLink.findByToken(token);

    if (!link) {
      return res.status(404).json({ error: "Link not found or has been removed" });
    }

    const accessCheck = SharedLink.isAccessible(link);
    if (!accessCheck.valid) {
      return res.status(410).json({ error: accessCheck.reason, isRevokedOrExpired: true });
    }

    // Increment view count
    await SharedLink.incrementView(token);

    res.json({
      token: link.share_token,
      original_name: link.original_name,
      mime_type: link.mime_type,
      file_size: link.file_size,
      category: link.category,
      description: link.description,
      owner_name: link.owner_name,
      has_password: link.has_password,
      allow_download: link.allow_download,
      expires_at: link.expires_at,
      max_downloads: link.max_downloads,
      download_count: link.download_count,
      view_count: link.view_count + 1,
      created_at: link.created_at,
    });
  } catch (err) {
    console.error("Public share info error:", err);
    res.status(500).json({ error: "Failed to retrieve shared document" });
  }
};

const verifySharePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const link = await SharedLink.findByToken(token);
    if (!link) {
      return res.status(404).json({ error: "Share link not found" });
    }

    const accessCheck = SharedLink.isAccessible(link);
    if (!accessCheck.valid) {
      return res.status(410).json({ error: accessCheck.reason });
    }

    if (!link.has_password) {
      return res.json({ verified: true });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required to access this file" });
    }

    const isMatch = await bcrypt.compare(password, link.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Create an access token for this share session valid for 4 hours
    const shareAccessToken = jwt.sign(
      { share_token: token, verified: true },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({ verified: true, shareAccessToken });
  } catch (err) {
    console.error("Verify share password error:", err);
    res.status(500).json({ error: "Failed to verify share password" });
  }
};

const checkShareAccess = async (link, req) => {
  const accessCheck = SharedLink.isAccessible(link);
  if (!accessCheck.valid) {
    return { ok: false, status: 410, message: accessCheck.reason };
  }

  if (link.has_password) {
    const authHeader = req.headers["x-share-token"] || req.query.pass_token;
    if (authHeader) {
      try {
        const decoded = jwt.verify(authHeader, JWT_SECRET);
        if (decoded.share_token === link.share_token && decoded.verified) {
          return { ok: true };
        }
      } catch (e) {
        // Fallback to direct password parameter
      }
    }

    const rawPassword = req.headers["x-share-password"] || req.query.password;
    if (rawPassword) {
      const match = await bcrypt.compare(rawPassword, link.password_hash);
      if (match) return { ok: true };
    }

    return { ok: false, status: 401, message: "Password required to view this file" };
  }

  return { ok: true };
};

const viewSharedFile = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await SharedLink.findByToken(token);

    if (!link) {
      return res.status(404).json({ error: "File not found" });
    }

    const auth = await checkShareAccess(link, req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.message });
    }

    if (!fs.existsSync(link.file_path)) {
      return res.status(404).json({ error: "Target file missing on disk" });
    }

    res.setHeader("Content-Type", link.mime_type);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(link.original_name)}"`);
    const stream = fs.createReadStream(link.file_path);
    stream.pipe(res);
  } catch (err) {
    console.error("View shared file error:", err);
    res.status(500).json({ error: "Failed to stream shared document" });
  }
};

const downloadSharedFile = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await SharedLink.findByToken(token);

    if (!link) {
      return res.status(404).json({ error: "File not found" });
    }

    if (!link.allow_download) {
      return res.status(403).json({ error: "Downloads are disabled by the owner for this document" });
    }

    const auth = await checkShareAccess(link, req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.message });
    }

    if (!fs.existsSync(link.file_path)) {
      return res.status(404).json({ error: "Target file missing on disk" });
    }

    // Increment download count
    await SharedLink.incrementDownload(token);

    res.setHeader("Content-Type", link.mime_type);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(link.original_name)}"`);
    const stream = fs.createReadStream(link.file_path);
    stream.pipe(res);
  } catch (err) {
    console.error("Download shared file error:", err);
    res.status(500).json({ error: "Failed to download shared file" });
  }
};

module.exports = {
  createShareLink,
  getFileShares,
  listUserShares,
  revokeShare,
  deleteShare,
  getPublicShareInfo,
  verifySharePassword,
  viewSharedFile,
  downloadSharedFile,
};
