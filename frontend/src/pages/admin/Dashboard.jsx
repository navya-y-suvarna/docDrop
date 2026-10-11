import React from "react";
import { Navigate } from "react-router-dom";

export const Dashboard = () => {
  return <Navigate to="/admin/queue" replace />;
};

export default Dashboard;
