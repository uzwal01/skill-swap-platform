import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; 
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import PrivateRoute from './components/PrivateRoute'; // Protect private routes
import Profile from './pages/Profile';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { useMessageStore } from './store/messageStore';
import { BrowseSkills } from './pages/BrowseSkills';
import ToastContainer from './components/ToastContainer';
import Requests from './pages/Requests';
import Matches from './pages/Matches';

const App = () => {
const fetchUser = useAuthStore((state) => state.fetchUser);
const user = useAuthStore((s) => s.user);
const connect = useMessageStore((s) => s.connect);
const loadConversations = useMessageStore((s) => s.loadConversations);

useEffect(() => {
  fetchUser();
  // run once on mount to restore session from token
  // Note: do not include fetchUser in deps; its reference may not be stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Connect socket globally once user is available so we can receive real-time messages/badges
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token && user) {
    connect(token);
    loadConversations();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<BrowseSkills />} />

        {/* Private Route */}
       
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/requests" element={
          <PrivateRoute>
            <Requests />
          </PrivateRoute>
        } />
        <Route path="/matches" element={
          <PrivateRoute>
            <Matches />
          </PrivateRoute>
        } />
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App;


