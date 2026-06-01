// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" />;
  }

  // If user is an admin, they should not be on standard user pages
  if (userRole === "admin") {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
};

export default PrivateRoute;
