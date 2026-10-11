import React, { useState } from "react";
import { Settings as SettingsIcon, Save, DollarSign, Clock, ShieldCheck } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

export const Settings = () => {
  const { toast } = useNotification();
  const [bwPrice, setBwPrice] = useState("2.00");
  const [colorPrice, setColorPrice] = useState("10.00");
  const [staplePrice, setStaplePrice] = useState("5.00");
  const [spiralPrice, setSpiralPrice] = useState("35.00");

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Print shop pricing rates updated successfully");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-8 h-8 text-purple-600" />
          Shop Operations & Pricing
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Configure per-page base rates, binding fees, and pickup policies.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Black & White Rate (₹ / page)
              </label>
              <input
                type="text"
                value={bwPrice}
                onChange={(e) => setBwPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Color Rate (₹ / page)
              </label>
              <input
                type="text"
                value={colorPrice}
                onChange={(e) => setColorPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Corner Staple Fee (₹)
              </label>
              <input
                type="text"
                value={staplePrice}
                onChange={(e) => setStaplePrice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Spiral Binding Fee (₹)
              </label>
              <input
                type="text"
                value={spiralPrice}
                onChange={(e) => setSpiralPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
