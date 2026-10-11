import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  FileText,
  DollarSign,
  Clock,
  Layers,
  CreditCard,
  QrCode,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { useNotification } from "../../context/NotificationContext";

export const PlaceOrderModal = ({ file, isOpen, onClose, onOrderPlaced }) => {
  const { toast } = useNotification();
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState("bw");
  const [paperSize, setPaperSize] = useState("A4");
  const [doubleSided, setDoubleSided] = useState(false);
  const [bindingType, setBindingType] = useState("none");
  const [totalPages, setTotalPages] = useState(1);
  const [notes, setNotes] = useState("");
  const [pickupOption, setPickupOption] = useState("1_hour");
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      setCreatedOrder(null);
      calculateQuote();
    }
  }, [isOpen, file, copies, colorMode, paperSize, doubleSided, bindingType, totalPages]);

  const calculateQuote = async () => {
    try {
      const price = await orderService.getQuote({
        copies,
        color_mode: colorMode,
        paper_size: paperSize,
        double_sided: doubleSided,
        binding_type: bindingType,
        total_pages: totalPages,
      });
      setEstimatedPrice(price);
    } catch (err) {
      // fallback local calculation
      let rate = colorMode === "color" ? 10 : 2;
      if (paperSize === "A3") rate *= 1.8;
      if (doubleSided) rate *= 0.85;
      let total = totalPages * rate * copies;
      if (bindingType === "staple") total += 5 * copies;
      if (bindingType === "spiral") total += 35 * copies;
      setEstimatedPrice(parseFloat(total.toFixed(2)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Calculate pickup timestamp
      let pickupTime = new Date();
      if (pickupOption === "1_hour") pickupTime.setHours(pickupTime.getHours() + 1);
      else if (pickupOption === "3_hours") pickupTime.setHours(pickupTime.getHours() + 3);
      else if (pickupOption === "tomorrow") pickupTime.setDate(pickupTime.getDate() + 1);

      const order = await orderService.createOrder({
        file_id: file.id,
        copies,
        color_mode: colorMode,
        paper_size: paperSize,
        double_sided: doubleSided,
        binding_type: bindingType,
        total_pages: totalPages,
        notes,
        pickup_time: pickupTime.toISOString(),
      });

      setCreatedOrder(order);
      toast.success("Print order placed successfully!");
      if (onOrderPlaced) onOrderPlaced(order);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Smart Print Drop</h3>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {createdOrder ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">Order Placed & Queued!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Order Number:{" "}
                  <span className="font-mono font-semibold text-slate-900">
                    {createdOrder.order_number}
                  </span>
                </p>
              </div>

              {/* Pickup Ticket Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-xs mx-auto shadow-sm">
                <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                  Contactless Pickup Code
                </span>
                <div className="my-2 py-2 px-4 bg-white border border-slate-300 rounded-xl font-mono font-extrabold text-2xl tracking-widest text-brand-600">
                  {createdOrder.pickup_code}
                </div>

                {createdOrder.pickup_qr && (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={createdOrder.pickup_qr}
                      alt="Pickup QR Code"
                      className="w-36 h-36 rounded-xl border border-slate-200 p-1 bg-white shadow-sm"
                    />
                  </div>
                )}
                <p className="text-[11px] text-slate-600 mt-2">
                  Show this QR or code at the counter for pickup.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Print Preferences Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Copies */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Copies</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Estimated Pages */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Document Pages (Est.)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={totalPages}
                    onChange={(e) => setTotalPages(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Color Mode & Paper Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Color Mode</label>
                  <select
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="bw">Black & White (₹2.00 / page)</option>
                    <option value="color">Full Color (₹10.00 / page)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paper Size</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="A4">Standard A4</option>
                    <option value="A3">Large A3 (+80%)</option>
                    <option value="Letter">Letter Size</option>
                  </select>
                </div>
              </div>

              {/* Duplex and Binding */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Binding Option</label>
                  <select
                    value={bindingType}
                    onChange={(e) => setBindingType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="none">None (Loose Sheets)</option>
                    <option value="staple">Corner Staple (+₹5.00)</option>
                    <option value="spiral">Spiral Binding (+₹35.00)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Double Sided?</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doubleSided}
                      onChange={(e) => setDoubleSided(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-slate-700 font-medium">Duplex (15% paper discount)</span>
                  </label>
                </div>
              </div>

              {/* Pickup Time Slot */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheduled Pickup</label>
                <select
                  value={pickupOption}
                  onChange={(e) => setPickupOption(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="1_hour">Express (Ready within ~1 Hour)</option>
                  <option value="3_hours">Today Evening (~3 Hours)</option>
                  <option value="tomorrow">Tomorrow Morning</option>
                </select>
              </div>

              {/* Instructions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keep separate folders, print landscape..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Price Breakdown Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between mt-3">
                <div>
                  <span className="text-xs text-slate-600 font-medium">Estimated Print Total:</span>
                  <p className="text-[11px] text-slate-600">
                    {copies} copy × {totalPages} pages ({colorMode.toUpperCase()})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900">₹{estimatedPrice.toFixed(2)}</span>
                  <p className="text-[10px] text-emerald-600 font-semibold">Taxes included</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Queuing Order...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      Confirm & Drop to Queue
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
