import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Printer,
  FileText,
  Clock,
  CheckCircle2,
  QrCode,
  Loader2,
  ArrowLeft,
  Calendar,
  Layers,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { useNotification } from "../../context/NotificationContext";

export const OrderDetails = () => {
  const { id } = useParams();
  const { toast } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await orderService.getOrderDetails(id);
      setOrder(data);
    } catch (err) {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-xs font-semibold">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <Link to="/orders" className="text-xs font-semibold text-brand-600 underline">
          Back to all orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link
          to="/orders"
          className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Order #{order.order_number}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Specs & Receipt */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Print Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-600 block">Document</span>
                <strong className="text-slate-900 truncate block">{order.original_name}</strong>
              </div>
              <div>
                <span className="text-slate-600 block">Copies</span>
                <strong className="text-slate-900">{order.copies}</strong>
              </div>
              <div>
                <span className="text-slate-600 block">Color Mode</span>
                <strong className="text-slate-900 uppercase">{order.color_mode}</strong>
              </div>
              <div>
                <span className="text-slate-600 block">Paper Size</span>
                <strong className="text-slate-900">{order.paper_size}</strong>
              </div>
              <div>
                <span className="text-slate-600 block">Duplex</span>
                <strong className="text-slate-900">{order.double_sided ? "Yes" : "No"}</strong>
              </div>
              <div>
                <span className="text-slate-600 block">Binding</span>
                <strong className="text-slate-900 capitalize">{order.binding_type}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600 font-medium">Total Amount</span>
              <p className="text-[11px] text-emerald-600 font-semibold">Taxes included</p>
            </div>
            <span className="text-2xl font-black text-slate-900">
              ₹{parseFloat(order.total_price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Right: Pickup Ticket Card */}
        <div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              Contactless Counter Ticket
            </span>
            <div className="py-2 px-4 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-2xl tracking-widest text-brand-600">
              {order.pickup_code}
            </div>

            {order.pickup_qr && (
              <div className="flex justify-center">
                <img
                  src={order.pickup_qr}
                  alt="Pickup QR Code"
                  className="w-44 h-44 rounded-xl border border-slate-200 p-2 bg-white shadow-sm"
                />
              </div>
            )}
            <p className="text-xs text-slate-600">
              Present this QR ticket at the print shop counter for instant collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
