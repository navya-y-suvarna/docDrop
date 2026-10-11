import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Printer,
  FileText,
  Clock,
  CheckCircle2,
  QrCode,
  Loader2,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { useNotification } from "../../context/NotificationContext";

export const OrderHistory = () => {
  const { toast } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.listUserOrders();
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            In Queue
          </span>
        );
      case "processing":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            Printing...
          </span>
        );
      case "ready_for_pickup":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Ready for Pickup!
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Orders & Pickups
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Track print progress and display your contactless pickup ticket.
          </p>
        </div>

        <Link
          to="/print-drop"
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          New Print Job
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
            <Printer className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">No orders yet</h3>
          <p className="text-xs text-slate-600 mb-6">
            You haven't queued any print jobs yet. Choose a document and send it to print!
          </p>
          <Link
            to="/print-drop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Create First Print Order
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Document</th>
                  <th className="px-6 py-3.5">Print Specs</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Total Price</th>
                  <th className="px-6 py-3.5 text-right">Pickup Code / QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {o.order_number}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 truncate max-w-xs">
                      {o.original_name || "Uploaded Document"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {o.copies} copy ({o.color_mode.toUpperCase()})
                      </span>
                      <span className="block text-[11px] text-slate-600">
                        {o.paper_size} • {o.double_sided ? "Duplex" : "Single"} • {o.binding_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(o.status)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{parseFloat(o.total_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                          {o.pickup_code}
                        </span>
                        {o.pickup_qr && (
                          <button
                            onClick={() => setSelectedQR(o)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                            title="View Pickup QR Ticket"
                          >
                            <QrCode className="w-4 h-4" />
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

      {/* QR Ticket Popup Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setSelectedQR(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              DocDrop Contactless Ticket
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Order #{selectedQR.order_number}
            </h3>

            <div className="my-3 py-2 px-4 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-2xl tracking-widest text-brand-600">
              {selectedQR.pickup_code}
            </div>

            <div className="flex justify-center my-3">
              <img
                src={selectedQR.pickup_qr}
                alt="Pickup QR Code"
                className="w-48 h-48 rounded-xl border border-slate-200 p-2 bg-white shadow-sm"
              />
            </div>

            <p className="text-xs text-slate-600">
              Scan this QR ticket at the print shop counter to verify and pick up your documents.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
