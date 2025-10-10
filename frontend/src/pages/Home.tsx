// src/pages/Home.tsx
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 mx-auto">
      <h1 className="text-4xl font-bold">Welcome to SkillSwap</h1>
      <p>Start learning and teaching new skills.</p>
      <div className="flex space-x-4 gap-4">
        <Link to="/login" className="px-6 py-2 bg-blue-500 text-white rounded-lg">
          Login
        </Link>
        <Link to="/register" className="px-6 py-2 bg-green-500 text-white rounded-lg">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;
