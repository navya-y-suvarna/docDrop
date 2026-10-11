import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layouts
import { UserLayout } from "../layouts/UserLayout";
import { AdminLayout } from "../layouts/AdminLayout";

// Public Pages
import { LandingPage } from "../pages/LandingPage";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { PublicShare } from "../pages/PublicShare";

// User Pages
import { Dashboard } from "../pages/user/Dashboard";
import { PlaceOrder } from "../pages/user/PlaceOrder";
import { OrderHistory } from "../pages/user/OrderHistory";
import { Profile } from "../pages/user/Profile";

// Admin Pages
import { QueueManagement } from "../pages/admin/QueueManagement";
import { Analytics } from "../pages/admin/Analytics";

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/share/:token" element={<PublicShare />} />

      {/* Authenticated User Routes */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/print-drop" element={<PlaceOrder />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin Operations Routes */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/queue" replace />} />
        <Route path="/admin/queue" element={<QueueManagement />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
