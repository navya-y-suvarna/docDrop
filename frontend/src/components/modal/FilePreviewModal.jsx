import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Share2,
  Printer,
  FileText,
  FileCode,
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  HardDrive,
  Tag,
  Loader2,
} from "lucide-react";
import { fileService } from "../../services/fileService";

export const FilePreviewModal = ({ file, isOpen, onClose, onShare, onPrint }) => {
  const [textContent, setTextContent] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (isOpen && file && file.category === "text") {
      setLoadingText(true);
      fetch(fileService.getViewUrl(file.id), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("docdrop_token")}`,
        },
      })
        .then((res) => res.text())
        .then((data) => {
          setTextContent(data);
          setLoadingText(false);
        })
        .catch(() => {
          setTextContent("Unable to load text preview.");
          setLoadingText(false);
        });
    } else {
      setTextContent("");
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const viewUrl = fileService.getViewUrl(file.id);
  const downloadUrl = fileService.getDownloadUrl(file.id);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              {file.category === "pdf" && <FileText className="w-5 h-5 text-rose-500" />}
              {file.category === "image" && <ImageIcon className="w-5 h-5 text-emerald-500" />}
              {file.category === "text" && <FileCode className="w-5 h-5 text-indigo-500" />}
              {!["pdf", "image", "text"].includes(file.category) && <FileText className="w-5 h-5 text-slate-500" />}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-900 text-base truncate">{file.original_name}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                  {formatBytes(file.file_size)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  {new Date(file.created_at).toLocaleDateString()}
                </span>
                <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                  {file.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onShare && (
              <button
                onClick={() => {
                  onClose();
                  onShare(file);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-brand-600" />
                Share
              </button>
            )}

            {onPrint && (
              <button
                onClick={() => {
                  onClose();
                  onPrint(file);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                Print Drop
              </button>
            )}

            <a
              href={downloadUrl}
              download={file.original_name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto bg-slate-100/60 p-4 min-h-[380px] flex items-center justify-center">
          {file.category === "image" && (
            <div className="max-w-full max-h-[70vh] flex items-center justify-center">
              <img
                src={viewUrl}
                alt={file.original_name}
                className="max-h-[65vh] max-w-full rounded-lg shadow-md object-contain border border-slate-200 bg-white"
              />
            </div>
          )}

          {file.category === "pdf" && (
            <div className="w-full h-[70vh] bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
              <iframe
                src={`${viewUrl}#toolbar=1`}
                title={file.original_name}
                className="w-full h-full border-0"
              />
            </div>
          )}

          {file.category === "text" && (
            <div className="w-full h-[65vh] bg-white rounded-lg shadow border border-slate-200 p-4 overflow-auto">
              {loadingText ? (
                <div className="h-full flex items-center justify-center gap-2 text-slate-600 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                  Loading text content...
                </div>
              ) : (
                <pre className="text-xs sm:text-sm text-slate-800 font-mono whitespace-pre-wrap select-text">
                  {textContent}
                </pre>
              )}
            </div>
          )}

          {!["image", "pdf", "text"].includes(file.category) && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">{file.original_name}</h4>
              <p className="text-xs text-slate-600 mb-6">
                Direct in-browser preview is not supported for this file type. You can download or print it directly.
              </p>
              <a
                href={downloadUrl}
                download={file.original_name}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Download File ({formatBytes(file.file_size)})
              </a>
            </div>
          )}
        </div>

        {/* Footer info / tags */}
        {(file.description || (file.tags && file.tags.length > 0)) && (
          <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            {file.description && (
              <p className="text-slate-600 italic">
                <span className="font-semibold text-slate-700">Note: </span>
                {file.description}
              </p>
            )}
            {file.tags && file.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-600" />
                {file.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
