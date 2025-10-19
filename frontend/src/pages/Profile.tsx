import { Navbar } from "@/components/Navbar";
import { getUserSessions } from "@/services/sessionService";
import { getMyProfile, updateProfile, UpdateProfilePayload } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import { Session } from "@/types/Session";
import { User } from "@/types/User";
import { useEffect, useMemo, useState } from "react";

const Profile: React.FC = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const [profile, setProfile] = useState<User | null>(null);
  const [form, setForm] = useState<{ name: string; bio: string; avatarUrl: string; email?: string; }>({ name: "", bio: "", avatarUrl: "" });
  const [offeredList, setOfferedList] = useState<{category:string; skill:string}[]>([]);
  const [wantedList, setWantedList] = useState<{category:string; skill:string}[]>([]);
  const [newOffered, setNewOffered] = useState<{category:string; skill:string}>({ category: "", skill: "" });
  const [newWanted, setNewWanted] = useState<{category:string; skill:string}>({ category: "", skill: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await getMyProfile();
        setUser(me);
        setProfile(me);
        setForm({
          name: me.name ?? "",
          bio: me.bio ?? "",
          avatarUrl: me.avatarUrl ?? "",
          email: me.email,
        });
        setOfferedList(me.skillsOffered ?? []);
        setWantedList(me.skillsWanted ?? []);
        try {
          const list = await getUserSessions();
          setSessions(list);
        } catch (err) {
          console.error('Failed to load sessions', err);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setUser]);

  const canSave = useMemo(() => form.name.trim().length >= 2, [form.name]);

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
        skillsOffered: offeredList,
        skillsWanted: wantedList,
      };
      const updated = await updateProfile(payload);
      setUser(updated);
      setProfile(updated);
      setOfferedList(updated.skillsOffered || []);
      setWantedList(updated.skillsWanted || []);
      setSuccess("Profile updated successfully");
      setEditOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6 text-center">Loading profile...</div>
      </div>
    );
  }

  const initials = (profile?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const outgoing = profile ? sessions.filter(s => s.fromUser._id === profile._id) : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-green-700">{success}</div>}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <section className="rounded border bg-white p-6 shadow-sm md:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold">{initials}</div>
              <div className="text-xl font-semibold">{profile?.name}</div>
              <div className="text-sm text-gray-500">{profile?.bio || 'Bio'}</div>
              <button onClick={() => setEditOpen(true)} className="mt-4 rounded bg-black px-4 py-2 text-sm text-white">Edit Profile</button>
            </div>
            {/* <div className="mt-6 space-y-2 text-sm">
              <div className="text-gray-600">Location not set</div>
              <div className="text-gray-600">Email: {profile?.email}</div>
              <div className="text-gray-600">Phone not set</div>
            </div> */}
            <div className="mt-6">
              <div className="mb-2 text-sm font-semibold">Skills I Can Teach</div>
              <div className="flex flex-wrap gap-2">
                {(profile?.skillsOffered || []).length === 0 ? (
                  <span className="text-xs text-gray-400">No skills set</span>
                ) : (
                  profile!.skillsOffered.map((s, i) => (
                    <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-xs">{s.skill}</span>
                  ))
                )}
              </div>
            </div>
            <div className="mt-6">
              <div className="mb-2 text-sm font-semibold">Skills I Want to Learn</div>
              <div className="flex flex-wrap gap-2">
                {(profile?.skillsWanted || []).length === 0 ? (
                  <span className="text-xs text-gray-400">No skills set</span>
                ) : (
                  profile!.skillsWanted.map((s, i) => (
                    <span key={i} className="rounded bg-gray-100 px-2 py-0.5 text-xs">{s.skill}</span>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="md:col-span-2">
            <div className="border-b bg-white px-6 pt-4">
              <div className="flex gap-6 text-sm">
                <div className="border-b-2 border-black pb-2 font-semibold">Swap Requests</div>
                <div className="pb-2 text-gray-400">Messages</div>
              </div>
            </div>
            <div className="rounded-b border border-t-0 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-semibold">Outgoing Requests</h3>
              {outgoing.length === 0 ? (
                <p className="text-sm text-gray-500">No outgoing requests.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {outgoing.map((s) => (
                    <li key={s._id} className="rounded border p-3">
                      To <span className="font-medium">{s.toUser.name}</span> - {s.fromUserSkill} - {s.toUserSkill}
                      <div className="text-xs text-gray-500">Status: {s.status}{s.availability ? ' | ' + s.availability : ''}{s.durationMinutes ? ' | ' + s.durationMinutes + ' min' : ''}</div>
                      {s.message && <div className="mt-1 text-gray-700">"{s.message}"</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Edit Profile</h3>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
                  {initials}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Avatar URL</label>
                  <input name="avatarUrl" type="url" value={form.avatarUrl} onChange={onChange} className="w-64 rounded border p-2 text-sm" placeholder="https://example.com/avatar.png" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input name="name" type="text" value={form.name} onChange={onChange} className="w-full rounded border p-2" placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input name="email" type="email" value={form.email || ''} readOnly className="w-full cursor-not-allowed rounded border bg-gray-100 p-2 text-gray-600" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Professional Title</label>
                <input name="bio" type="text" value={form.bio} onChange={onChange} className="w-full rounded border p-2" placeholder="Web Developer, Designer, ..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Skills I Can Teach</label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {offeredList.length === 0 ? (
                    <span className="text-xs text-gray-400">None added</span>
                  ) : (
                    offeredList.map((s, i) => (
                      <span key={i} className="flex items-center gap-2 rounded bg-gray-100 px-2 py-0.5 text-xs">
                        {s.category}: {s.skill}
                        <button type="button" onClick={() => setOfferedList(offeredList.filter((_, idx) => idx !== i))} className="text-gray-500">×</button>
                      </span>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 rounded border p-2 text-sm" placeholder="Add a skill you can teach..." value={newOffered.skill} onChange={(e) => setNewOffered({ ...newOffered, skill: e.target.value })} />
                  <select className="w-40 rounded border p-2 text-sm" value={newOffered.category} onChange={(e) => setNewOffered({ ...newOffered, category: e.target.value })}>
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
                  <button type="button" className="rounded bg-black px-3 py-2 text-sm text-white" onClick={() => { if(newOffered.skill && newOffered.category){ setOfferedList([...offeredList, newOffered]); setNewOffered({ category:'', skill:''}); } }}>Add</button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Skills I Want to Learn</label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {wantedList.length === 0 ? (
                    <span className="text-xs text-gray-400">None added</span>
                  ) : (
                    wantedList.map((s, i) => (
                      <span key={i} className="flex items-center gap-2 rounded bg-gray-100 px-2 py-0.5 text-xs">
                        {s.category}: {s.skill}
                        <button type="button" onClick={() => setWantedList(wantedList.filter((_, idx) => idx !== i))} className="text-gray-500">×</button>
                      </span>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 rounded border p-2 text-sm" placeholder="Add a skill you want to learn..." value={newWanted.skill} onChange={(e) => setNewWanted({ ...newWanted, skill: e.target.value })} />
                  <select className="w-40 rounded border p-2 text-sm" value={newWanted.category} onChange={(e) => setNewWanted({ ...newWanted, category: e.target.value })}>
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
                  <button type="button" className="rounded bg-black px-3 py-2 text-sm text-white" onClick={() => { if(newWanted.skill && newWanted.category){ setWantedList([...wantedList, newWanted]); setNewWanted({ category:'', skill:''}); } }}>Add</button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="rounded border px-4 py-2" onClick={() => setEditOpen(false)}>Cancel</button>
                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50" disabled={!canSave || saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
