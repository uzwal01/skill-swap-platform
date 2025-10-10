// import { Navigate } from 'react-router-dom';
// import { useAuthStore } from '@/store/authStore'; // Zustand store for authentication

// const PrivateRoute = ({ children }: { children: JSX.Element }) => {
//   const user = useAuthStore((state) => state.user); // Access user state

//   if (!user) {
//     return <Navigate to="/login" replace />; // Redirect to login if not authenticated
//   }

//   return children; // Render the protected component
// };

// export default PrivateRoute;
