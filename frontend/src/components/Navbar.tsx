import { useAuthStore } from "@/store/authStore";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  return (
    <nav className="sticky top-0 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        <Link to="/" className="font-bold text-lg text-blue-600">SkillSwap</Link>
        <nav className="flex items-center gap-6">
          <Link to="/browse" className="text-gray-700 hover:text-blue-600">Browse Skills</Link>
        </nav>
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-gray-700 hover:text-blue-600">My Profile</Link>
            <button onClick={logout} className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600">Log out</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Log in</Link>
            <Link to="/register" className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
