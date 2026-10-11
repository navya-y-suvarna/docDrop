import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import {
  FileText,
  Printer,
  History,
  ShieldCheck,
  Bell,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Upload,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export const Navbar = ({ onOpenUpload }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Doc<span className="text-brand-600">Drop</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 -mt-1">
                  Vault & Print Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Document Vault
                </Link>
                <Link
                  to="/print-drop"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive("/print-drop")
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Printer className="w-4 h-4 text-brand-500" />
                  Print Drop
                </Link>
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive("/orders")
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <History className="w-4 h-4 text-slate-600" />
                  Orders & Pickups
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/queue"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith("/admin")
                        ? "bg-purple-50 text-purple-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Admin Queue
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Upload Button */}
                {onOpenUpload && (
                  <button
                    onClick={onOpenUpload}
                    className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                )}

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-600 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (!n.is_read) markAsRead(n.id);
                                if (n.link) navigate(n.link);
                                setShowNotifications(false);
                              }}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.is_read ? "bg-brand-50/50" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                                <span className="text-[10px] text-slate-600 shrink-0">
                                  {new Date(n.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-800">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-600 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {user?.role}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-600" />
                        Account Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/queue"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          Admin Console
                        </Link>
                      )}
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Document Vault
          </Link>
          <Link
            to="/print-drop"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Print Drop
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Orders & Pickups
          </Link>
          {isAdmin && (
            <Link
              to="/admin/queue"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50"
            >
              Admin Queue
            </Link>
          )}
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};
