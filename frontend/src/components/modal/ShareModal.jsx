import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Lock,
  Clock,
  Download,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Loader2,
  Eye,
  Link as LinkIcon,
} from "lucide-react";
import { shareService } from "../../services/shareService";
import { useNotification } from "../../context/NotificationContext";

export const ShareModal = ({ file, isOpen, onClose }) => {
  const { toast } = useNotification();
  const [existingShares, setExistingShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  // Form options
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState("24");
  const [maxDownloads, setMaxDownloads] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);

  // Newly created share
  const [latestShare, setLatestShare] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      loadShares();
      setLatestShare(null);
      setPassword("");
      setUsePassword(false);
      setExpiresInHours("24");
      setMaxDownloads("");
      setAllowDownload(true);
    }
  }, [isOpen, file]);

  const loadShares = async () => {
    setLoadingShares(true);
    try {
      const shares = await shareService.getFileShares(file.id);
      setExistingShares(shares);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingShares(false);
    }
  };

  const handleCreateShare = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const options = {
        expires_in_hours: expiresInHours ? parseInt(expiresInHours, 10) : null,
        max_downloads: maxDownloads ? parseInt(maxDownloads, 10) : null,
        allow_download: allowDownload,
        password: usePassword ? password : null,
      };

      const share = await shareService.createShare(file.id, options);
      setLatestShare(share);
      toast.success("Secure share link generated!");
      loadShares();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate share link");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (token) => {
    try {
      await shareService.revokeShare(token);
      toast.success("Share link revoked successfully");
      loadShares();
      if (latestShare?.share_token === token) {
        setLatestShare(null);
      }
    } catch (err) {
      toast.error("Failed to revoke share link");
    }
  };

  const copyToClipboard = (url, token) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 2500);
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Share Document</h3>
              <p className="text-xs text-slate-600 truncate max-w-xs">{file.original_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Latest Generated Link Showcase */}
          {latestShare && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Active Share Link
                </span>
                <span className="text-xs text-emerald-700">Ready to share</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={latestShare.share_url}
                  className="flex-1 text-xs font-mono bg-white border border-emerald-300 rounded-lg px-3 py-2 text-slate-800 select-all"
                />
                <button
                  onClick={() => copyToClipboard(latestShare.share_url, latestShare.share_token)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  {copiedToken === latestShare.share_token ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Create New Share Link Form */}
          <form onSubmit={handleCreateShare} className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Create New Secure Link
            </h4>

            {/* Expiration setting */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                Link Expiration
              </label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="1">1 Hour (Quick peek)</option>
                <option value="24">24 Hours (Standard)</option>
                <option value="168">7 Days (One week)</option>
                <option value="720">30 Days (One month)</option>
                <option value="0">Never Expires</option>
              </select>
            </div>

            {/* Password Protection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  Require password to access
                </span>
              </label>

              {usePassword && (
                <input
                  type="password"
                  placeholder="Enter a secret password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={usePassword}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              )}
            </div>

            {/* Max downloads & Permissions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Max Downloads (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={maxDownloads}
                  onChange={(e) => setMaxDownloads(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Download Permission
                </label>
                <select
                  value={allowDownload ? "true" : "false"}
                  onChange={(e) => setAllowDownload(e.target.value === "true")}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="true">Allow File Download</option>
                  <option value="false">View-Only (No Download)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  Generate Link
                </>
              )}
            </button>
          </form>

          {/* Existing Links List */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Existing Shared Links ({existingShares.length})
            </h4>

            {loadingShares ? (
              <div className="py-4 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                Loading shares...
              </div>
            ) : existingShares.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No share links have been created yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {existingShares.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      s.is_revoked
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : "bg-white border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-800 font-medium truncate max-w-[180px]">
                          ...{s.share_token.slice(-10)}
                        </span>
                        {s.has_password && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium text-[10px] flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Passcode
                          </span>
                        )}
                        {s.is_revoked && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-medium text-[10px]">
                            Revoked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {s.view_count} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" /> {s.download_count} dl
                        </span>
                        <span>
                          Expires:{" "}
                          {s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "Never"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!s.is_revoked && (
                        <>
                          <button
                            onClick={() => copyToClipboard(s.share_url, s.share_token)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                            title="Copy link"
                          >
                            {copiedToken === s.share_token ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRevoke(s.share_token)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                            title="Revoke link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
