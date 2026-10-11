import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Printer,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { fileService } from "../../services/fileService";
import { orderService } from "../../services/orderService";
import { useNotification } from "../../context/NotificationContext";

export const PlaceOrder = () => {
  const { toast } = useNotification();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState("");

  // Print preferences
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState("bw");
  const [paperSize, setPaperSize] = useState("A4");
  const [doubleSided, setDoubleSided] = useState(false);
  const [bindingType, setBindingType] = useState("none");
  const [totalPages, setTotalPages] = useState(1);
  const [pickupOption, setPickupOption] = useState("1_hour");
  const [notes, setNotes] = useState("");

  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await fileService.listFiles();
      setFiles(data);
      if (data.length > 0) {
        setSelectedFileId(String(data[0].id));
      }
    } catch (err) {
      toast.error("Failed to fetch documents for printing");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    calculatePrice();
  }, [copies, colorMode, paperSize, doubleSided, bindingType, totalPages]);

  const calculatePrice = async () => {
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
      let rate = colorMode === "color" ? 10 : 2;
      if (paperSize === "A3") rate *= 1.8;
      if (doubleSided) rate *= 0.85;
      let total = totalPages * rate * copies;
      if (bindingType === "staple") total += 5 * copies;
      if (bindingType === "spiral") total += 35 * copies;
      setEstimatedPrice(parseFloat(total.toFixed(2)));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedFileId) {
      toast.error("Please select a document to print");
      return;
    }

    setSubmitting(true);
    try {
      let pickupTime = new Date();
      if (pickupOption === "1_hour") pickupTime.setHours(pickupTime.getHours() + 1);
      else if (pickupOption === "3_hours") pickupTime.setHours(pickupTime.getHours() + 3);
      else if (pickupOption === "tomorrow") pickupTime.setDate(pickupTime.getDate() + 1);

      const order = await orderService.createOrder({
        file_id: parseInt(selectedFileId, 10),
        copies,
        color_mode: colorMode,
        paper_size: paperSize,
        double_sided: doubleSided,
        binding_type: bindingType,
        total_pages: totalPages,
        notes,
        pickup_time: pickupTime.toISOString(),
      });

      setCompletedOrder(order);
      toast.success("Order queued successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit print order");
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Order Confirmed & Queued
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Pickup Ticket #{completedOrder.order_number}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Your print job has been submitted to the digital queue.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-sm mx-auto shadow-sm">
            <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              Contactless Counter Pickup Code
            </span>
            <div className="my-2 py-3 px-4 bg-white border border-slate-300 rounded-xl font-mono font-extrabold text-3xl tracking-widest text-brand-600">
              {completedOrder.pickup_code}
            </div>

            {completedOrder.pickup_qr && (
              <div className="mt-4 flex justify-center">
                <img
                  src={completedOrder.pickup_qr}
                  alt="Pickup QR Code"
                  className="w-44 h-44 rounded-xl border border-slate-200 p-2 bg-white shadow-sm"
                />
              </div>
            )}
            <p className="text-xs text-slate-600 mt-3">
              Show this code or QR ticket at the counter when you arrive.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/orders"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              View All Orders
            </Link>
            <button
              onClick={() => {
                setCompletedOrder(null);
                loadFiles();
              }}
              className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Printer className="w-8 h-8 text-indigo-600" />
          Smart Print & Xerox Drop
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Customize paper size, duplex mode, and binding with upfront pricing. Pick up without waiting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Options */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
          {/* Select File */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Select Document
              </h3>
              <Link
                to="/dashboard"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Upload New Document →
              </Link>
            </div>

            {loadingFiles ? (
              <div className="py-4 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                Loading your files...
              </div>
            ) : files.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center">
                You have no documents uploaded yet.{" "}
                <Link to="/dashboard" className="font-bold underline">
                  Upload a document first
                </Link>
              </div>
            ) : (
              <select
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {files.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.original_name} ({(f.file_size / 1024).toFixed(1)} KB)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Print Preferences */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Print Customization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Number of Copies
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total Document Pages
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={totalPages}
                  onChange={(e) => setTotalPages(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Color Mode
                </label>
                <select
                  value={colorMode}
                  onChange={(e) => setColorMode(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="bw">Black & White (₹2.00 / page)</option>
                  <option value="color">Full Color (₹10.00 / page)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Paper Size
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="A4">Standard A4</option>
                  <option value="A3">Large A3 (+80%)</option>
                  <option value="Letter">Letter Size</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Binding Style
                </label>
                <select
                  value={bindingType}
                  onChange={(e) => setBindingType(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="none">None (Loose sheets)</option>
                  <option value="staple">Corner Staple (+₹5.00)</option>
                  <option value="spiral">Spiral Binding (+₹35.00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Duplex Printing
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doubleSided}
                    onChange={(e) => setDoubleSided(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Double-Sided (15% paper savings)
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Pickup Time
              </label>
              <select
                value={pickupOption}
                onChange={(e) => setPickupOption(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="1_hour">Express (Ready within ~1 Hour)</option>
                <option value="3_hours">Today Evening (~3 Hours)</option>
                <option value="tomorrow">Tomorrow Morning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Special Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Spiral bind front cover, landscape orientation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || files.length === 0}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting to Print Queue...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                Place Print Order (₹{estimatedPrice.toFixed(2)})
              </>
            )}
          </button>
        </form>

        {/* Right Summary Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Price Estimate Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span>Color Mode</span>
                <span className="font-semibold text-slate-800 uppercase">{colorMode}</span>
              </div>
              <div className="flex justify-between">
                <span>Paper Size</span>
                <span className="font-semibold text-slate-800">{paperSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Print Mode</span>
                <span className="font-semibold text-slate-800">
                  {doubleSided ? "Double-Sided" : "Single-Sided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Binding</span>
                <span className="font-semibold text-slate-800 capitalize">{bindingType}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity</span>
                <span className="font-semibold text-slate-800">
                  {copies} copies × {totalPages} pages
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-bold text-slate-900">Total Price</span>
                <p className="text-[10px] text-emerald-600 font-semibold">Taxes included</p>
              </div>
              <span className="text-2xl font-black text-indigo-600">
                ₹{estimatedPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Contactless Counter Pickup
            </div>
            <p className="text-[11px] text-indigo-800/90 leading-relaxed">
              Once placed, you will receive an encrypted QR ticket and order code. Walk up to the DocDrop counter to collect your prints instantly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
