import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData } from "@/types/FormData";
import { loginSchema } from "@/schemas/loginSchema";
import { useAuthStore } from "@/store/authStore";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const next = params.get('next');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const payload: LoginFormData = {
        email: data.email.trim().toLowerCase(),
        password: data.password.trim(),
      };
      await login(payload);
      navigate(next || "/"); // Redirect on success
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full mx-auto rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="my-4 pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mx-4">
        {/* Email */}
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            {...register("email")}
            className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm">Password</label>
          <input
            type="password"
            {...register("password")}
            className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md transition text-white"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-2 text-sm">
          <p className="text-gray-600">Don't have an account? <Link to="/register" className="text-red-500 hover:text-red-600" >Sign Up</Link></p>
        </div>
      </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
