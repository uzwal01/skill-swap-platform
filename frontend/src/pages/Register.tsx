import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  RegisterPayload } from "@/types/FormData";
import { registerSchema } from "@/schemas/registerSchema";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
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
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Register</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm">Name</label>
          <input
            type="text"
            {...register("name")}
            className="w-full p-2 border border-gray-300 rounded"
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
            className="w-full p-2 border border-gray-300 rounded"
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
            className="w-full p-2 border border-gray-300 rounded"
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
            className="w-full p-2 border border-gray-300 rounded"
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
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-gray-400 text-xs mt-1">
            Enter as Category:Skill pairs, separated by commas.
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
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-gray-400 text-xs mt-1">
            Enter as Category:Skill pairs, separated by commas.
          </p>
          {errors.skillsWantedInput && (
            <p className="text-red-500 text-xs">{errors.skillsWantedInput.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
