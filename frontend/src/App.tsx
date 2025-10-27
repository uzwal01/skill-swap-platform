import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; 
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import PrivateRoute from './components/PrivateRoute'; // Protect private routes
import Profile from './pages/Profile';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { BrowseSkills } from './pages/BrowseSkills';
import ToastContainer from './components/ToastContainer';

const App = () => {
const fetchUser = useAuthStore((state) => state.fetchUser);

useEffect(() => {
  fetchUser();
  // run once on mount to restore session from token
  // Note: do not include fetchUser in deps; its reference may not be stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<BrowseSkills />} />

        {/* Private Route */}
        <Route path="/dashboard" element={<PrivateRoute><Profile /></PrivateRoute>} />        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App;


