import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // Home page
import Login from './pages/Login'; // Login page
import Register from './pages/Register'; // Register page
// import Dashboard from './pages/Dashboard'; // Dashboard page
// import PrivateRoute from './components/PrivateRoute'; // Protect private routes

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Route
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } /> */}
      </Routes>
    </div>
  );
};

export default App;
