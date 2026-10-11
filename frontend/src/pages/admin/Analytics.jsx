import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  FileText,
  DollarSign,
  Share2,
  HardDrive,
  Printer,
  Loader2,
  Calendar,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { useNotification } from "../../context/NotificationContext";

export const Analytics = () => {
  const { toast } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await orderService.getAdminStats();
      setData(res);
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-xs font-semibold">Loading platform analytics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const users = data?.users || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          DocDrop Platform Analytics
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          System overview, storage consumption, user directory, and revenue metrics.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Total Users
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.total_users || 0}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Documents Hosted
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.total_files || 0}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Vault Storage
            </span>
            <span className="text-2xl font-black text-slate-900">
              {formatBytes(stats.total_storage_bytes)}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Shop Revenue
            </span>
            <span className="text-2xl font-black text-slate-900">
              ₹{parseFloat(stats.total_revenue || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* User Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Registered User Accounts</h3>
          <span className="text-xs text-slate-600 font-medium">{users.length} accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Files Uploaded</th>
                <th className="px-6 py-3.5">Storage Used</th>
                <th className="px-6 py-3.5 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-[11px] text-slate-600">{u.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{u.file_count}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">
                    {formatBytes(u.total_storage)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
