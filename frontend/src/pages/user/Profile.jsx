import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { authService } from "../../services/authService";
import { User, Lock, Mail, ShieldCheck, KeyRound, Loader2 } from "lucide-react";

export const Profile = () => {
  const { user, updateUserState } = useAuth();
  const { toast } = useNotification();

  const [name, setName] = useState(user?.name || "");
  const [updatingName, setUpdatingName] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setUpdatingName(true);
    try {
      const res = await authService.updateProfile(name);
      updateUserState(res.user);
      toast.success("Name updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdatingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Account Profile
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Manage your personal information, security credentials, and access role.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left ID Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{user?.name}</h3>
            <p className="text-xs text-slate-600">{user?.email}</p>
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
            {user?.role} Account
          </div>
        </div>

        {/* Right Form Fields */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Name */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              Personal Information
            </h3>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-600 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={updatingName}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm"
              >
                {updatingName ? "Saving..." : "Update Name"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-600" />
              Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-type new password"
                    className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm"
              >
                {updatingPassword ? "Changing Password..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
