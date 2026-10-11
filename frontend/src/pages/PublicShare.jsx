import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Lock,
  Download,
  Eye,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Calendar,
  HardDrive,
  User,
  ArrowRight,
  FileCode,
  Image as ImageIcon,
} from "lucide-react";
import { shareService } from "../services/shareService";

export const PublicShare = () => {
  const { token } = useParams();

  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Password state
  const [password, setPassword] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passToken, setPassToken] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Text preview
  const [textContent, setTextContent] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    loadPublicShare();
  }, [token]);

  const loadPublicShare = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shareService.getPublicShare(token);
      setShareData(data);
      if (!data.has_password) {
        setIsUnlocked(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "This shared link is invalid or no longer exists.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockPassword = async (e) => {
    e.preventDefault();
    setVerifyingPassword(true);
    try {
      const res = await shareService.verifyPublicPassword(token, password);
      if (res.verified) {
        setPassToken(res.shareAccessToken);
        setIsUnlocked(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Incorrect password");
    } finally {
      setVerifyingPassword(false);
    }
  };

  useEffect(() => {
    if (isUnlocked && shareData && shareData.category === "text") {
      setLoadingText(true);
      const url = shareService.getPublicViewUrl(token, passToken);
      fetch(url)
        .then((res) => res.text())
        .then((data) => {
          setTextContent(data);
          setLoadingText(false);
        })
        .catch(() => {
          setTextContent("Unable to render preview.");
          setLoadingText(false);
        });
    }
  }, [isUnlocked, shareData, token, passToken]);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold">Retrieving shared document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Link Unavailable</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all"
            >
              Go to DocDrop Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Password Lock Screen
  if (!isUnlocked && shareData?.has_password) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              Protected Document
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{shareData.original_name}</h2>
            <p className="text-xs text-slate-600 mt-1">
              Shared by <span className="font-semibold text-slate-800">{shareData.owner_name}</span>
            </p>
          </div>

          <form onSubmit={handleUnlockPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Enter passcode to unlock file"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-xs rounded-xl border border-slate-300 p-3 text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <button
              type="submit"
              disabled={verifyingPassword}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {verifyingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Unlock Document
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Unlocked Document Viewer
  const viewUrl = shareService.getPublicViewUrl(token, passToken);
  const downloadUrl = shareService.getPublicDownloadUrl(token, passToken);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-900">
              Doc<span className="text-brand-600">Drop</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {shareData.allow_download && (
              <a
                href={downloadUrl}
                download={shareData.original_name}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Document
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col space-y-6">
        {/* Document Info Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 truncate">
            <div className="p-3 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              {shareData.category === "pdf" && <FileText className="w-6 h-6 text-rose-500" />}
              {shareData.category === "image" && <ImageIcon className="w-6 h-6 text-emerald-500" />}
              {shareData.category === "text" && <FileCode className="w-6 h-6 text-indigo-500" />}
              {!["pdf", "image", "text"].includes(shareData.category) && (
                <FileText className="w-6 h-6 text-slate-500" />
              )}
            </div>
            <div className="truncate">
              <h1 className="text-lg font-bold text-slate-900 truncate">
                {shareData.original_name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  Shared by {shareData.owner_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                  {formatBytes(shareData.file_size)}
                </span>
                {shareData.expires_at && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock className="w-3.5 h-3.5" />
                      Expires {new Date(shareData.expires_at).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {shareData.allow_download && (
              <a
                href={downloadUrl}
                download={shareData.original_name}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download ({formatBytes(shareData.file_size)})
              </a>
            )}
          </div>
        </div>

        {/* Live File Viewer Canvas */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center p-4 min-h-[480px]">
          {shareData.category === "pdf" && (
            <iframe
              src={`${viewUrl}#toolbar=1`}
              title={shareData.original_name}
              className="w-full h-[75vh] border-0 rounded-xl"
            />
          )}

          {shareData.category === "image" && (
            <div className="max-h-[75vh] flex items-center justify-center">
              <img
                src={viewUrl}
                alt={shareData.original_name}
                className="max-h-[70vh] max-w-full rounded-xl object-contain shadow"
              />
            </div>
          )}

          {shareData.category === "text" && (
            <div className="w-full h-[70vh] overflow-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
              {loadingText ? (
                <div className="h-full flex items-center justify-center gap-2 text-xs text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  Loading text...
                </div>
              ) : (
                <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap select-text text-slate-800">
                  {textContent}
                </pre>
              )}
            </div>
          )}

          {!["pdf", "image", "text"].includes(shareData.category) && (
            <div className="text-center p-8 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{shareData.original_name}</h3>
              <p className="text-xs text-slate-600 mt-1 mb-6">
                Online preview is not supported for this file format. Download to open on your device.
              </p>
              {shareData.allow_download && (
                <a
                  href={downloadUrl}
                  download={shareData.original_name}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
