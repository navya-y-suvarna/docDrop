import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";
import { ShieldCheck, ListOrdered, BarChart3, Users, Settings } from "lucide-react";

export const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { label: "Print Queue", path: "/admin/queue", icon: ListOrdered },
    { label: "Platform Analytics", path: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Admin Subheader */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-sm tracking-wide">DocDrop Admin Console</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50">
              Shop Operations
            </span>
          </div>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    active
                      ? "bg-purple-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 pb-16">
        <Outlet />
      </main>
    </div>
  );
};
