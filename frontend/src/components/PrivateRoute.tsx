import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";
import React from "react";


interface PrivateRouteProps {
    children: React.ReactElement;  // Child component that needs protection
}


const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        // If user is not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // If logged in, render the protected component
    return children;
};

export default PrivateRoute;

