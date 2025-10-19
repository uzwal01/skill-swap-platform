import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";
import React from "react";


interface PrivateRouteProps {
    children: React.ReactElement;  // Child component that needs protection
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Read slices separately to avoid constructing a new object each render
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return <div className="p-6 text-center">Checking session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;

