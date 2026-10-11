import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Upload,
  Share2,
  Printer,
  Trash2,
  Eye,
  Download,
  HardDrive,
  Layers,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Grid,
  List,
  Loader2,
  Sparkles,
  Tag,
  AlertCircle,
} from "lucide-react";
import { fileService } from "../../services/fileService";
import { useNotification } from "../../context/NotificationContext";
import { FilePreviewModal } from "../../components/modal/FilePreviewModal";
import { ShareModal } from "../../components/modal/ShareModal";
import { PlaceOrderModal } from "../../components/modal/PlaceOrderModal";

export const Dashboard = () => {
  const { openUploadModal } = useOutletContext() || {};
  const { toast } = useNotification();

  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // Modals state
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [printFile, setPrintFile] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [filesData, statsData] = await Promise.all([
        fileService.listFiles({ search, category, sort }),
        fileService.getStats(),
      ]);
      setFiles(filesData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen to global upload event
  useEffect(() => {
    const handleUploadEvent = () => loadData();
    window.addEventListener("docdrop:fileUploaded", handleUploadEvent);
    return () => window.removeEventListener("docdrop:fileUploaded", handleUploadEvent);
  }, [loadData]);

  const handleDelete = async (file) => {
    if (!window.confirm(`Are you sure you want to delete "${file.original_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await fileService.deleteFile(file.id);
      toast.success(`"${file.original_name}" removed`);
      loadData();
    } catch (err) {
      toast.error("Failed to delete file");
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-500" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case "text":
        return <FileCode className="w-5 h-5 text-indigo-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const categories = [
    { id: "all", label: "All Files" },
    { id: "pdf", label: "PDFs" },
    { id: "image", label: "Images" },
    { id: "document", label: "Documents" },
    { id: "spreadsheet", label: "Spreadsheets" },
    { id: "text", label: "Code & Text" },
    { id: "archive", label: "Archives" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Top Banner / Metrics Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Document Vault
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Secure cloud repository, encrypted share links, and print queue manager.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/print-drop"
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            Smart Print Hub
          </Link>

          <button
            onClick={openUploadModal}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Total Documents
            </span>
            <span className="text-xl font-black text-slate-900">
              {stats?.totalFiles ?? 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Storage Used
            </span>
            <span className="text-xl font-black text-slate-900">
              {formatBytes(stats?.totalStorageBytes)}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Active Shares
            </span>
            <span className="text-xl font-black text-slate-900">
              {stats?.activeShares ?? 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Storage Limit
            </span>
            <span className="text-xl font-black text-slate-900">25 MB / file</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category Pills, Sort, View Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by name or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="size_desc">Largest Size</option>
                <option value="size_asc">Smallest Size</option>
              </select>
            </div>

            <div className="flex items-center border border-slate-300 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Documents Grid or List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold">Loading your vault documents...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">No documents found</h3>
          <p className="text-xs text-slate-600 mb-6">
            {search || category !== "all"
              ? "No files matched your search or category filter. Try resetting your query."
              : "Your document vault is currently empty. Upload your first document to get started."}
          </p>
          <button
            onClick={openUploadModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm shadow-brand-500/25 transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-200 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3">
                {/* Header Icon & Share Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                    {getCategoryIcon(file.category)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {file.active_share_count > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px] flex items-center gap-1">
                        <Share2 className="w-2.5 h-2.5" /> Shared
                      </span>
                    )}
                    <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                      {file.category}
                    </span>
                  </div>
                </div>

                {/* File Name & Notes */}
                <div>
                  <h4
                    onClick={() => setPreviewFile(file)}
                    className="font-bold text-slate-900 text-sm truncate hover:text-brand-600 cursor-pointer transition-colors"
                    title={file.original_name}
                  >
                    {file.original_name}
                  </h4>
                  {file.description ? (
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 italic">
                      {file.description}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Uploaded on {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {file.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {file.tags.length > 3 && (
                      <span className="text-[10px] text-slate-600 font-medium">
                        +{file.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 text-[11px]">
                  {formatBytes(file.file_size)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-white transition-colors"
                    title="Preview file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShareFile(file)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-white transition-colors"
                    title="Share file"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setPrintFile(file)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-white transition-colors"
                    title="Print Drop"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <a
                    href={fileService.getDownloadUrl(file.id)}
                    download={file.original_name}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-white transition-colors"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(file)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-white transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Size</th>
                <th className="px-6 py-3.5">Date Added</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="shrink-0">{getCategoryIcon(file.category)}</div>
                    <div className="truncate max-w-sm">
                      <span
                        onClick={() => setPreviewFile(file)}
                        className="font-bold text-slate-900 hover:text-brand-600 cursor-pointer block truncate"
                      >
                        {file.original_name}
                      </span>
                      {file.description && (
                        <span className="text-[11px] text-slate-600 truncate block">
                          {file.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 font-medium text-[11px]">
                      {file.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {formatBytes(file.file_size)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(file.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-brand-600"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShareFile(file)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPrintFile(file)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-purple-600"
                        title="Print Drop"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <a
                        href={fileService.getDownloadUrl(file.id)}
                        download={file.original_name}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-emerald-600"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(file)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onShare={(f) => setShareFile(f)}
        onPrint={(f) => setPrintFile(f)}
      />

      {/* Share Modal */}
      <ShareModal
        file={shareFile}
        isOpen={!!shareFile}
        onClose={() => setShareFile(null)}
      />

      {/* Place Print Order Modal */}
      <PlaceOrderModal
        file={printFile}
        isOpen={!!printFile}
        onClose={() => setPrintFile(null)}
        onOrderPlaced={() => loadData()}
      />
    </div>
  );
};
