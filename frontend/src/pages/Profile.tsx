import MessagesPane from '@/components/MessagesPane';
import { Navbar } from "@/components/Navbar";
import {
  getUserSessions,
  updateSessionStatus,
} from "@/services/sessionService";
import SessionRequestModel from "@/components/SessionRequestModel";
import UserCard from "@/components/UserCard";
import { createSession } from "@/services/sessionService";
import { getMutualMatches } from "@/services/matchService";
import {
  getMyProfile,
  updateProfile,
  UpdateProfilePayload,
} from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import { Session } from "@/types/Session";
import { User } from "@/types/User";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useToastStore } from "@/store/toastStore";
import { Match } from "@/types/Match";
import { X } from "lucide-react";
import { ensureConversation } from "@/services/messageService";
import { useMessageStore } from "@/store/messageStore";

const Profile: React.FC = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const [profile, setProfile] = useState<User | null>(null);
  const [form, setForm] = useState<{
    name: string;
    bio: string;
    avatarUrl: string;
    email?: string;
  }>({ name: "", bio: "", avatarUrl: "" });
  const [offeredList, setOfferedList] = useState<
    { category: string; skill: string }[]
  >([]);
  const [wantedList, setWantedList] = useState<
    { category: string; skill: string }[]
  >([]);
  const [newOffered, setNewOffered] = useState<{
    category: string;
    skill: string;
  }>({ category: "", skill: "" });
  const [newWanted, setNewWanted] = useState<{
    category: string;
    skill: string;
  }>({ category: "", skill: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Removed local error/success banners; using toasts only
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);
  const [tab, setTab] = useState<"matches" | "requests" | "messages">(
    "matches"
  );
  const [matches, setMatches] = useState<Match[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const openConversation = useMessageStore((s) => s.openConversation);
  const unreadTotal = useMessageStore((s) => s.conversations.reduce((sum, c) => sum + (c.unread ?? 0), 0));
  useEffect(() => {
    const init = async () => {
      setLoading(true);

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
          console.error("Failed to load sessions", err);
        }
      } catch (e) {
        addToast({
          type: "error",
          message: e instanceof Error ? e.message : "Failed to load profile",
        });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setUser, addToast]);

  const canSave = useMemo(() => form.name.trim().length >= 2, [form.name]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
      addToast({ type: "success", message: "Profile updated" });
      setEditOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update profile";
      addToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  // Load matches when Matches tab is active
  useEffect(() => {
    if (tab !== "matches") return;
    let mounted = true;
    getMutualMatches()
      .then((list) => {
        if (mounted) setMatches(list);
      })
      .catch(() =>
        addToast({ type: "error", message: "Failed to load matches" })
      );
    return () => {
      mounted = false;
    };
  }, [tab, addToast]);

  // Handle deep-link to messages tab and specific conversation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('tab');
    const conv = params.get('conv');
    if (t === 'messages') setTab('messages');
    if (conv) openConversation(conv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6 text-center">Loading profile...</div>
      </div>
    );
  }

  const initials = (profile?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const outgoing = profile
    ? sessions.filter((s) => s.fromUser._id === profile._id)
    : [];
  const incoming = profile
    ? sessions.filter((s) => s.toUser._id === profile._id)
    : [];
  const pendingIncoming = incoming.filter((s) => s.status === "pending").length;

  // Full lists are shown in the tab (no preview limiting)

  const act = async (
    id: string,
    status: "accepted" | "rejected" | "cancelled" | "completed"
  ) => {
    try {
      setBusyId(id);
      await updateSessionStatus(id, status);
      const list = await getUserSessions();
      setSessions(list);
      const msg =
        status === "accepted"
          ? "Request accepted"
          : status === "rejected"
          ? "Request rejected"
          : status === "cancelled"
          ? "Request cancelled"
          : "Session completed";
      addToast({ type: "success", message: msg });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update request";
      addToast({ type: "error", message: msg });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Left: Profile summary */}
          <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex mb-3 text-lg h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                {initials}
              </div>
              <div className="text-xl text-gray-900 font-semibold">
                {profile?.name}
              </div>
              <div className="text-sm text-gray-500">
                {profile?.bio || "Bio"}
              </div>
              <button
                onClick={() => setEditOpen(true)}
                className="mt-4 rounded bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm text-white transition"
              >
                Edit Profile
              </button>
            </div>
            <div className="mt-6">
              <div className="mb-2 text-sm font-semibold">
                Skills I Can Teach
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile?.skillsOffered || []).length === 0 ? (
                  <span className="text-xs text-gray-400">No skills set</span>
                ) : (
                  (profile?.skillsOffered ?? []).map((s, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 mt-1 rounded-md"
                    >
                      {s.skill}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="mt-6">
              <div className="mb-2 text-sm font-semibold">
                Skills I Want to Learn
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile?.skillsWanted || []).length === 0 ? (
                  <span className="text-xs text-gray-400">No skills set</span>
                ) : (
                  (profile?.skillsWanted ?? []).map((s, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 mt-1 rounded-md"
                    >
                      {s.skill}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Right: Requests */}
          <section className="md:col-span-2">
            <div className="rounded-t-xl border border-gray-100 bg-white shadow-sm px-6 pt-4 ">
              <div className="flex gap-6 text-sm">
                <button
                  className={`pb-2 hover:text-black transition ${tab === "matches" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
                  onClick={() => setTab("matches")}
                >
                  Matches
                </button>
                <button
                  className={`relative pb-2 hover:text-black transition ${tab === "requests" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
                  onClick={() => setTab("requests")}
                >
                  Swap Requests
                  {pendingIncoming > 0 && (
                    <span className="absolute -top-2 -right-3 rounded-full bg-red-600 px-1.5 text-[10px] text-white">{pendingIncoming}</span>
                  )}
                </button>
                <button
                  className={`relative pb-2 hover:text-black transition ${tab === "messages" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`}
                  onClick={() => setTab("messages")}
                >
                  Messages
                  {unreadTotal > 0 && (
                    <span className="absolute -top-2 -right-3 rounded-full bg-red-600 px-1.5 text-[10px] text-white">{unreadTotal}</span>
                  )}
                </button>
              </div>
            </div>
            <div className="rounded-b-xl border border-gray-100 bg-white shadow-sm mt-1 p-6">
              {tab === "matches" && (
                <>
                  <div className="mb-3 flex justify-end">
                    <button
                      className="rounded-lg border border-blue-300 hover:text-blue-500 transition px-3 py-1 text-xs text-gray-500"
                      onClick={() => navigate("/matches")}
                    >
                      View all matches
                    </button>
                  </div>
                  {matches.length === 0 ? (
                    <p className="text-sm text-gray-500">No matches yet.</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {matches.map((m) => (
                        <UserCard
                          key={m._id}
                          user={m}
                          onRequest={(u) => {
                            setSelectedUser(u);
                            setRequestOpen(true);
                          }}
                          onMessage={async (u) => {
                            try {
                              const conv = await ensureConversation(u._id);
                              setTab('messages');
                              openConversation(conv._id);
                              navigate(`/profile?tab=messages&conv=${conv._id}`, { replace: true });
                            } catch (err) {
                              const status = isAxiosError(err) ? err.response?.status : undefined;
                              if (status === 403) {
                                addToast({ type: 'error', message: 'Messaging is available after your swap is accepted.' });
                              } else {
                                addToast({ type: 'error', message: 'Unable to start conversation.' });
                              }
                            }
                          }}
                          className=""
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
              {tab === "requests" && (
                <>
                <div className="flex justify-end">
                    <button
                      className="rounded-lg border border-blue-300 hover:text-blue-500 transition px-3 py-1 text-xs text-gray-500"
                      onClick={() => navigate("/requests")}
                    >
                      View all requests 
                    </button>
                  </div>
                  

                  <h3 className="mb-4 text-base font-semibold">
                    Incoming Requests
                  </h3>
                  {incoming.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No incoming requests.
                    </p>
                  ) : (
                    <ul className="space-y-3 text-sm">
                      {incoming.map((s) => (
                        <li
                          key={s._id}
                          className="rounded-lg border border-blue-200 shadow-sm p-3 "
                        >
                          From{" "}
                          <span className="font-medium">{s.fromUser.name}</span>{" "}
                          - {s.fromUserSkill} - {s.toUserSkill}
                          <div className="text-xs text-gray-500">
                            Status: {s.status}
                            {s.availability ? " | " + s.availability : ""}
                            {s.durationMinutes
                              ? " | " + s.durationMinutes + " min"
                              : ""}
                          </div>
                          {s.message && (
                            <div className="mt-1 text-gray-700">
                              "{s.message}"
                            </div>
                          )}
                          <div className="mt-3 flex gap-2">
                            {s.status === "pending" && (
                              <>
                                <button
                                  className="rounded bg-green-500 hover:bg-green-600 transition px-3 py-1 text-white disabled:opacity-50"
                                  disabled={busyId === s._id}
                                  onClick={() => act(s._id, "accepted")}
                                >
                                  Accept
                                </button>
                                <button
                                  className="rounded bg-red-500 hover:bg-red-600 transition px-3 py-1 text-white disabled:opacity-50"
                                  disabled={busyId === s._id}
                                  onClick={() => act(s._id, "rejected")}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {s.status === "accepted" && (
                              <button
                                className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                                disabled={busyId === s._id}
                                onClick={() => act(s._id, "completed")}
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <h3 className="mb-4 mt-8 text-base font-semibold">
                    Outgoing Requests
                  </h3>
                  {outgoing.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No outgoing requests.
                    </p>
                  ) : (
                    <ul className="space-y-3 text-sm">
                      {outgoing.map((s) => (
                        <li
                          key={s._id}
                          className="rounded-lg border border-blue-200 shadow-sm p-3"
                        >
                          To{" "}
                          <span className="font-medium">{s.toUser.name}</span> -{" "}
                          {s.fromUserSkill} - {s.toUserSkill}
                          <div className="text-xs text-gray-500">
                            Status: {s.status}
                            {s.availability ? " | " + s.availability : ""}
                            {s.durationMinutes
                              ? " | " + s.durationMinutes + " min"
                              : ""}
                          </div>
                          {s.message && (
                            <div className="mt-1 text-gray-700">
                              "{s.message}"
                            </div>
                          )}
                          <div className="mt-3 flex gap-2">
                            {s.status === "pending" && (
                              <button
                                className="rounded bg-gray-600 px-3 py-1 text-white disabled:opacity-50"
                                disabled={busyId === s._id}
                                onClick={() => act(s._id, "cancelled")}
                              >
                                Cancel
                              </button>
                            )}
                            {s.status === "accepted" && (
                              <button
                                className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                                disabled={busyId === s._id}
                                onClick={() => act(s._id, "completed")}
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                </>
              )}

              {tab === "messages" && (
                <MessagesPane />
              )}
            </div>
          </section>
        </div>
      </main>

      {requestOpen && selectedUser && (
        <SessionRequestModel
          open={requestOpen}
          match={selectedUser}
          onClose={() => setRequestOpen(false)}
          onSubmit={async (data) => {
            await createSession(data);
            addToast({ type: "success", message: "Request sent" });
            setRequestOpen(false);
          }}
        />
      )}

      {/* Edit Profile */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg bg-white p-6 shadow rounded-lg">
            <h3 className="mb-4 text-lg font-semibold">Edit Profile</h3>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  {initials}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Avatar URL
                  </label>
                  <input
                    name="avatarUrl"
                    type="url"
                    value={form.avatarUrl}
                    onChange={onChange}
                    className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-64"
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={onChange}
                  className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email || ""}
                  readOnly
                  className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Professional Title
                </label>
                <input
                  name="bio"
                  type="text"
                  value={form.bio}
                  onChange={onChange}
                  className="p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none w-full"
                  placeholder="Web Developer, Designer, ..."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Skills I Can Teach
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
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
                            setOfferedList(
                              offeredList.filter((_, idx) => idx !== i)
                            )
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
                    onChange={(e) =>
                      setNewOffered({ ...newOffered, skill: e.target.value })
                    }
                  />
                  <select
                    className="w-40 p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none"
                    value={newOffered.category}
                    onChange={(e) =>
                      setNewOffered({ ...newOffered, category: e.target.value })
                    }
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
                    className="rounded bg-blue-500 hover:bg-blue-600 transition px-3 py-1 text-xs text-white"
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
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Skills I Want to Learn
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
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
                            setWantedList(
                              wantedList.filter((_, idx) => idx !== i)
                            )
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
                    onChange={(e) =>
                      setNewWanted({ ...newWanted, skill: e.target.value })
                    }
                  />
                  <select
                    className="w-40 p-2 border border-gray-300 text-sm rounded-md focus:ring-1 mt-2 focus:ring-blue-300 focus:outline-none"
                    value={newWanted.category}
                    onChange={(e) =>
                      setNewWanted({ ...newWanted, category: e.target.value })
                    }
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
                    className="rounded bg-blue-500 hover:bg-blue-600 transition px-3 py-1 text-xs text-white"
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
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded border border-red-100 text-red-400 hover:bg-red-400 transition hover:text-white px-4 py-2"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-500 hover:bg-blue-600 transition px-4 py-2 text-white disabled:opacity-50"
                  disabled={!canSave || saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;


