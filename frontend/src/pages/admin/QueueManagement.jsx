import React, { useState, useEffect } from "react";
import {
  ListOrdered,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  QrCode,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { useNotification } from "../../context/NotificationContext";

export const QueueManagement = () => {
  const { toast } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Counter Pickup Verification Input
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState(null);

  useEffect(() => {
    loadQueue();
  }, [statusFilter]);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await orderService.listQueue({
        status: statusFilter,
        search,
      });
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load print queue");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await orderService.updateStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
      loadQueue();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleVerifyPickup = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setVerifying(true);
    setVerifiedOrder(null);
    try {
      const res = await orderService.verifyPickup(verificationCode.trim());
      setVerifiedOrder(res.order);
      toast.success("Pickup Code Verified!");
      setVerificationCode("");
      loadQueue();
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid pickup code or order not found");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ListOrdered className="w-8 h-8 text-purple-600" />
            Digital Print Shop Queue
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time incoming print jobs, counter queue management, and contactless pickup verification.
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Queue
        </button>
      </div>

      {/* Counter Fast Pickup Scanner Widget */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">
            Counter Verification Scanner
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            Verify Customer Pickup Code
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Scan QR code or enter the 6-character pickup code to confirm customer identity and handover prints.
          </p>

          <form onSubmit={handleVerifyPickup} className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. 6PL7C8 or Order ID"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-400 flex-1 uppercase"
            />
            <button
              type="submit"
              disabled={verifying}
              className="px-6 py-3 rounded-xl bg-white text-purple-950 font-bold text-xs hover:bg-purple-50 transition-all flex items-center justify-center gap-2 shadow-md shrink-0"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-900" />
                  Verifying...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 text-purple-700" />
                  Verify Pickup
                </>
              )}
            </button>
          </form>

          {/* Verified Order Snapshot */}
          {verifiedOrder && (
            <div className="mt-4 p-4 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Match Found: {verifiedOrder.order_number}
                </span>
                <span className="capitalize px-2 py-0.5 rounded bg-white/20 text-[10px] font-semibold">
                  Status: {verifiedOrder.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-purple-100 pt-1">
                <div>Customer: <strong className="text-white">{verifiedOrder.user_name}</strong></div>
                <div>Document: <strong className="text-white truncate block">{verifiedOrder.original_name}</strong></div>
                <div>Copies: <strong className="text-white">{verifiedOrder.copies}</strong></div>
                <div>Price: <strong className="text-white">₹{verifiedOrder.total_price}</strong></div>
              </div>
              {verifiedOrder.status !== "completed" && (
                <div className="pt-2">
                  <button
                    onClick={() => handleStatusUpdate(verifiedOrder.id, "completed")}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                  >
                    Confirm & Complete Handover
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Queue Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Queue" },
            { id: "pending", label: "Pending" },
            { id: "processing", label: "Processing" },
            { id: "ready_for_pickup", label: "Ready for Pickup" },
            { id: "completed", label: "Completed" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadQueue()}
            className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-xs font-semibold">Loading print queue jobs...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Printer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">No print jobs in queue</h3>
          <p className="text-xs text-slate-600 mt-1">There are no orders matching this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">File & Specifications</th>
                  <th className="px-6 py-3.5">Pickup Code</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900 block">{o.order_number}</span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 block">{o.user_name}</span>
                      <span className="text-[11px] text-slate-600">{o.user_email}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="font-medium text-slate-900 block truncate">
                        {o.original_name}
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        {o.copies} copies • {o.color_mode.toUpperCase()} • {o.paper_size} • {o.binding_type}
                      </span>
                      {o.notes && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                          Note: {o.notes}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                        {o.pickup_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                          o.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : o.status === "processing"
                            ? "bg-blue-100 text-blue-800 animate-pulse"
                            : o.status === "ready_for_pickup"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.status === "pending" && (
                          <button
                            onClick={() => handleStatusUpdate(o.id, "processing")}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                          >
                            Start Printing
                          </button>
                        )}
                        {o.status === "processing" && (
                          <button
                            onClick={() => handleStatusUpdate(o.id, "ready_for_pickup")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                          >
                            Mark Ready
                          </button>
                        )}
                        {o.status === "ready_for_pickup" && (
                          <button
                            onClick={() => handleStatusUpdate(o.id, "completed")}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                          >
                            Handover Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
