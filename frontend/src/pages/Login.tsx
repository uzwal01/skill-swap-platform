import { loginSchema } from '@/schemas/loginSchema';
import { LoginFormData } from '@/types/FormData';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const Login = () => {
  // Initialize form with react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),  // Zod validation
  });

  // Function to handle form submission
  const onSubmit = async (data: LoginFormData) => {
    console.log(data);
    // Call your API for login (use Zustand store or API calls)
    // Example: await loginUser(data.email, data.password);
  };

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Email Input */}
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
