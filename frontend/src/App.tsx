import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; 
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import PrivateRoute from './components/PrivateRoute'; // Protect private routes
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

const App = () => {
const fetchUser = useAuthStore((state) => state.fetchUser);

useEffect(() => {
  fetchUser();
  // run once on mount to restore session from token
}, [fetchUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Route */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;
