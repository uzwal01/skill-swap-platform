import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";
import React from "react";

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Read slices separately to avoid constructing a new object each render
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  // If a token exists but user isn't hydrated yet, wait for fetchUser
  if (isLoading || (hasToken && !user)) {
    return <div className="p-6 text-center">Checking session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;

