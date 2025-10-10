import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterFormData } from '@/types/FormData'; // Import the type
import { registerSchema } from '@/schemas/registerSchema';

const Register = () => {
  // Initialize form with react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),  // Zod validation
  });

  // Function to handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    console.log(data);
    // Call your API for registration (use Zustand store or API calls)
    // Example: await registerUser(data.name, data.email, data.password);
  };

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Name Input */}
        <div>
          <label className="block text-sm">Name</label>
          <input
            type="text"
            {...register('name')}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

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

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm">Confirm Password</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
