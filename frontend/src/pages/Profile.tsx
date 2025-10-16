import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/User";
import { getMyProfile, updateProfile, UpdateProfilePayload } from "@/services/userService";

const stringifySkills = (skills: { category: string; skill: string }[] = []) =>
  skills.map((s) => `${s.category}:${s.skill}`).join(", ");

const parseSkills = (input: string) =>
  input
    .split(",")
    .map((pair) => {
      const [category, skill] = pair.split(":").map((s) => s.trim());
      return { category, skill };
    })
    .filter((s) => s.category && s.skill);

const Profile: React.FC = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState<{
    name: string;
    bio: string;
    avatarUrl: string;
    skillsOfferedInput: string;
    skillsWantedInput: string;
  }>({ name: "", bio: "", avatarUrl: "", skillsOfferedInput: "", skillsWantedInput: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize from store, then ensure server is the source of truth
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile: User = await getMyProfile();
        setUser(profile);
        setForm({
          name: profile.name ?? "",
          bio: profile.bio ?? "",
          avatarUrl: profile.avatarUrl ?? "",
          skillsOfferedInput: stringifySkills(profile.skillsOffered ?? []),
          skillsWantedInput: stringifySkills(profile.skillsWanted ?? []),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setUser]);

  const canSave = useMemo(() => {
    return form.name.trim().length >= 2; // simple guard
  }, [form.name]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: UpdateProfilePayload = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        avatarUrl: form.avatarUrl.trim(),
        skillsOffered: parseSkills(form.skillsOfferedInput),
        skillsWanted: parseSkills(form.skillsWantedInput),
      };
      const updated = await updateProfile(payload);
      setUser(updated);
      setSuccess("Profile updated successfully");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading profile…</div>;

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Your Profile</h1>

      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-green-700">{success}</div>}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            className="w-full rounded border p-2"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={onChange}
            className="w-full rounded border p-2"
            placeholder="Tell others about your interests, goals, or background"
            rows={4}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Avatar URL</label>
          <input
            name="avatarUrl"
            type="url"
            value={form.avatarUrl}
            onChange={onChange}
            className="w-full rounded border p-2"
            placeholder="https://example.com/avatar.png"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Skills You Offer</label>
          <input
            name="skillsOfferedInput"
            type="text"
            value={form.skillsOfferedInput}
            onChange={onChange}
            className="w-full rounded border p-2"
            placeholder="Programming:React, Design:Figma"
          />
          <p className="mt-1 text-xs text-gray-500">Enter as Category:Skill pairs, separated by commas.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Skills You Want</label>
          <input
            name="skillsWantedInput"
            type="text"
            value={form.skillsWantedInput}
            onChange={onChange}
            className="w-full rounded border p-2"
            placeholder="Programming:Node.js, Design:Photoshop"
          />
          <p className="mt-1 text-xs text-gray-500">Enter as Category:Skill pairs, separated by commas.</p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={!canSave || saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
