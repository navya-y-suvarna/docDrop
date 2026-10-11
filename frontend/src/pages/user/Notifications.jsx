import React from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Clock, FileText, Printer, ArrowRight } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

export const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time alerts on your file access, share links, and print queue readiness.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-brand-600" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-600 text-xs">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            You have no notifications right now.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                !n.is_read ? "bg-brand-50/40 hover:bg-brand-50/70" : "hover:bg-slate-50"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline pt-1"
                  >
                    View details <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <span className="text-[11px] text-slate-600 shrink-0">
                {new Date(n.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
