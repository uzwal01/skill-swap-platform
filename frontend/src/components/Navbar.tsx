import { useAuthStore } from "@/store/authStore";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold">SkillSwap</Link>
        <nav className="flex items-center gap-6">
          <Link to="/browse" className="text-sm font-medium">Browse Skills</Link>
        </nav>
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-sm font-medium">My Profile</Link>
            <button onClick={logout} className="rounded bg-black px-4 py-2 text-sm text-white">Log out</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700">Log in</Link>
            <Link to="/register" className="rounded bg-black px-4 py-2 text-sm text-white">Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
};
