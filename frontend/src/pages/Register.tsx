import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  RegisterPayload } from "@/types/FormData";
import { registerSchema } from "@/schemas/registerSchema";
import { useAuthStore } from "@/store/authStore";
import { Link, useNavigate } from "react-router-dom";
import z from "zod";

type RegisterFormData = z.infer<typeof registerSchema>;
const Register = () => {
  const { register: registerStore, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Helper function to parse skills input string into array of { category, skill }
  const parseSkills = (input: string) => {
    return input
      .split(",")
      .map((pair) => {
        const [category, skill] = pair.split(":").map((s) => s.trim());
        return { category, skill };
      })
      .filter((s) => s.category && s.skill); // remove empty entries
  };

  const onSubmit = async (data: RegisterFormData) => {
    const skillsOffered = parseSkills(data.skillsOfferedInput || "");
    const skillsWanted = parseSkills(data.skillsWantedInput || "");

    const payload: RegisterPayload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password.trim(),
      confirmPassword: data.confirmPassword.trim(),
      skillsOffered,
      skillsWanted,
    };

    try {
      // Cast to any temporarily until store types are updated to accept skills arrays
      await registerStore(payload);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-center mb-4">Register</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-6">
        {/* Name */}
        <div>
          <label className="block text-sm">Name</label>
          <input
            type="text"
            {...register("name")}
            className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

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

        {/* Confirm Password */}
        <div>
          <label className="block text-sm">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Skills Offered */}
        <div>
          <label className="block text-sm">Skills You Offer</label>
          <input
            type="text"
            {...register("skillsOfferedInput")}
            placeholder="Example: Programming:React, Design:Figma"
            className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
          />
          <p className="text-gray-400 text-xs mt-1">
            Enter as Category: Skill pairs, separated by commas.
          </p>
          {errors.skillsOfferedInput && (
            <p className="text-red-500 text-xs">{errors.skillsOfferedInput.message}</p>
          )}
        </div>

        {/* Skills Wanted */}
        <div>
          <label className="block text-sm">Skills You Want</label>
          <input
            type="text"
            {...register("skillsWantedInput")}
            placeholder="Example: Programming:Node.js, Design:Photoshop"
            className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
          />
          <p className="text-gray-400 text-xs mt-1">
            Enter as Category: Skill pairs, separated by commas.
          </p>
          {errors.skillsWantedInput && (
            <p className="text-red-500 text-xs">{errors.skillsWantedInput.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 mt-2 bg-blue-500 hover:bg-blue-600 rounded-md transition text-white"
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <div className="text-center text-sm mt-2">
          <p className="text-gray-600">Already have an account? <Link to="/login" className="text-red-500 hover:text-red-600">Log In</Link></p>
        </div>
      </form>
    </div>
    </div>
  );
};

export default Register;
