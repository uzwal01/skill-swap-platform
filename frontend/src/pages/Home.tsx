import { Navbar } from "@/components/Navbar";
import { getFeaturedUsers } from "@/services/userService";
import { User } from "@/types/User";
import UserCard from "@/components/UserCard";
import SessionRequestModel from "@/components/SessionRequestModel";
import { createSession } from "@/services/sessionService";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


const Home = () => {
  const [featured, setFeatured] = useState<User[]>([]);
  const authUser = useAuthStore((s) => s.user);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const addToast = useToastStore(s => s.addToast);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    getFeaturedUsers().then(setFeatured).catch(console.error);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="py-16 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">Swap Skills, Learn & Teach for Free!</h1>
          <p className="text-gray-600 mt-2">Exchange your expertise with others...</p>
          <div className="mt-8 flex justify-center">
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-80 p-3 border border-gray-300 rounded-l-md focus:ring-1 focus:ring-blue-300 focus:outline-none" placeholder="Search skills (e.g., Graphic Design)" />
            <button onClick={() => navigate(`/browse?search=${encodeURIComponent(searchTerm)}`)} className="bg-blue-500 hover:bg-blue-600 text-white px-5 rounded-r-md transition">Find Skills</button>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured Skill Swappers</h2>
            <button onClick={() => navigate('/browse')} className="rounded border px-4 py-2 text-sm">View All Skills</button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured
              .filter(u => u._id !== (authUser?._id ?? ''))
              .map(u => (
              <UserCard
                key={u._id}
                user={u}
                onRequest={(clicked) => {
                  if (!authUser) return navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
                  setSelectedUser(clicked);
                  setRequestOpen(true);
                }}
                className="transition-transform hover:-translate-y-1 hover:shadow-lg"
              />
            ))}
          </div>
        </section>
      </main>
      {requestOpen && selectedUser && (
        <SessionRequestModel
          open={requestOpen}
          match={selectedUser}
          onClose={() => setRequestOpen(false)}
          onSubmit={async (data) => {
            await createSession(data);
            addToast({ type: 'success', message: 'Request sent' });
            setRequestOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
