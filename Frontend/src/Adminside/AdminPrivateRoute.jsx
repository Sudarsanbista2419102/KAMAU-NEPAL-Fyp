import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPrivateRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const token = localStorage.getItem('token');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
  const userRole = localStorage.getItem('userRole');

  const isLoggedIn = !!adminToken || 
                    (!!token && (adminUser?.role === 'admin' || adminUser?.role === 'super_admin' || userRole === 'admin'));

  console.log("AdminPrivateRoute: isLoggedIn =", isLoggedIn, "role =", adminUser?.role || userRole);

  if (!isLoggedIn) {
    console.warn("AdminPrivateRoute: Not logged in, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  console.log("AdminPrivateRoute: Access granted to protected admin route");
  return children;
};

export default AdminPrivateRoute;
