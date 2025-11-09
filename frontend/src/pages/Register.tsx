import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  RegisterPayload } from "@/types/FormData";
import { registerSchema } from "@/schemas/registerSchema";
import { useAuthStore } from "@/store/authStore";
import { Link, useNavigate } from "react-router-dom";
import z from "zod";
import { useState } from "react";
import { X } from "lucide-react";

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

  // Local state to build skills lists like in Edit Profile
  const [offeredList, setOfferedList] = useState<
    { category: string; skill: string }[]
  >([]);
  const [wantedList, setWantedList] = useState<
    { category: string; skill: string }[]
  >([]);
  const [newOffered, setNewOffered] = useState<{ category: string; skill: string }>(
    { category: "", skill: "" }
  );
  const [newWanted, setNewWanted] = useState<{ category: string; skill: string }>(
    { category: "", skill: "" }
  );

  const onSubmit = async (data: RegisterFormData) => {
    // Include any pending typed-but-not-added items
    const pendingOffered = newOffered.category.trim() && newOffered.skill.trim()
      ? [{ category: newOffered.category.trim(), skill: newOffered.skill.trim() }]
      : [];
    const pendingWanted = newWanted.category.trim() && newWanted.skill.trim()
      ? [{ category: newWanted.category.trim(), skill: newWanted.skill.trim() }]
      : [];

    const normalize = (arr: { category: string; skill: string }[]) =>
      arr
        .map((s) => ({ category: s.category.trim(), skill: s.skill.trim() }))
        .filter((s) => s.category.length > 0 && s.skill.length > 0);

    const skillsOffered = normalize([...offeredList, ...pendingOffered]);
    const skillsWanted = normalize([...wantedList, ...pendingWanted]);

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
      navigate("/profile");
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
          <div className="mb-2 flex flex-wrap gap-2 mt-2">
            {offeredList.length === 0 ? (
              <span className="text-xs text-gray-400">None added</span>
            ) : (
              offeredList.map((s, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 rounded bg-gray-100 px-2 py-0.5 text-xs"
                >
                  {s.category}: {s.skill}
                  <button
                    type="button"
                    title="Remove"
                    aria-label="Remove"
                    onClick={() =>
                      setOfferedList(offeredList.filter((_, idx) => idx !== i))
                    }
                    className="text-gray-500"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
              placeholder="Add a skill you can teach..."
              value={newOffered.skill}
              onChange={(e) => setNewOffered({ ...newOffered, skill: e.target.value })}
            />
            <select
              className="w-40 p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none"
              value={newOffered.category}
              onChange={(e) => setNewOffered({ ...newOffered, category: e.target.value })}
            >
              <option value="">Category</option>
              <option>Design</option>
              <option>Development</option>
              <option>Music</option>
              <option>Language</option>
              <option>Business</option>
              <option>Lifestyle</option>
              <option>Photography</option>
              <option>Education</option>
            </select>
            <button
              type="button"
              className="rounded bg-blue-500 hover:bg-blue-600 transition px-3 py-1 text-xs text-white mt-2"
              onClick={() => {
                if (newOffered.skill && newOffered.category) {
                  setOfferedList([...offeredList, newOffered]);
                  setNewOffered({ category: "", skill: "" });
                }
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Skills Wanted */}
        <div>
          <label className="block text-sm">Skills You Want</label>
          <div className="mb-2 flex flex-wrap gap-2 mt-2">
            {wantedList.length === 0 ? (
              <span className="text-xs text-gray-400">None added</span>
            ) : (
              wantedList.map((s, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 rounded bg-gray-100 px-2 py-0.5 text-xs"
                >
                  {s.category}: {s.skill}
                  <button
                    type="button"
                    title="Remove"
                    aria-label="Remove"
                    onClick={() =>
                      setWantedList(wantedList.filter((_, idx) => idx !== i))
                    }
                    className="text-gray-500"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
              placeholder="Add a skill you want to learn..."
              value={newWanted.skill}
              onChange={(e) => setNewWanted({ ...newWanted, skill: e.target.value })}
            />
            <select
              className="w-40 p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none"
              value={newWanted.category}
              onChange={(e) => setNewWanted({ ...newWanted, category: e.target.value })}
            >
              <option value="">Category</option>
              <option>Design</option>
              <option>Development</option>
              <option>Music</option>
              <option>Language</option>
              <option>Business</option>
              <option>Lifestyle</option>
              <option>Photography</option>
              <option>Education</option>
            </select>
            <button
              type="button"
              className="rounded bg-blue-500 hover:bg-blue-600 transition px-3 py-1 text-xs text-white mt-2"
              onClick={() => {
                if (newWanted.skill && newWanted.category) {
                  setWantedList([...wantedList, newWanted]);
                  setNewWanted({ category: "", skill: "" });
                }
              }}
            >
              Add
            </button>
          </div>
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
