import { Navbar } from "@/components/Navbar";
import { getFeaturedUsers } from "@/services/userService";
import { User } from "@/types/User";
import UserCard from "@/components/UserCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [featured, setFeatured] = useState<User[]>([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getFeaturedUsers().then(setFeatured).catch(console.error);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="text-center">
          <h1 className="text-4xl font-bold">Swap Skills, Learn & Teach for Free!</h1>
          <p className="mt-4 text-gray-600">Exchange your expertise with others...</p>
          <div className="mt-8 flex justify-center gap-3">
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-80 rounded border px-4 py-2" placeholder="Search skills (e.g., Graphic Design)" />
            <button onClick={() => navigate(`/browse?search=${encodeURIComponent(searchTerm)}`)} className="rounded bg-black px-4 py-2 text-white">Find Skills</button>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured Skill Swappers</h2>
            <button onClick={() => navigate('/browse')} className="rounded border px-4 py-2 text-sm">View All Skills</button>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(user => (
              <UserCard key={user._id} user={user} onRequest={() => {/* open modal later */}} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
