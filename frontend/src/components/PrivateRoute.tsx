import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";
import React from "react";


interface PrivateRouteProps {
    children: React.ReactElement;  // Child component that needs protection
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthStore((s) => ({ user: s.user, isLoading: s.isLoading }));

  if (isLoading) {
    return <div className="p-6 text-center">Checking session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;

