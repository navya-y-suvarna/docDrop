import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, QrCode, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export const Payment = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Payment & Billing</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          DocDrop supports instant UPI QR scanning, card payments, and pay-at-counter cash options for all print drop jobs.
        </p>

        <div className="pt-4 flex justify-center gap-3">
          <Link
            to="/orders"
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
          >
            View Orders & Receipts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
