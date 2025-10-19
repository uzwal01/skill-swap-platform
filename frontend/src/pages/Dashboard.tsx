import { getMutualMatches } from "@/services/matchService";
import { createSession, getUserSessions, updateSessionStatus } from "@/services/sessionService";
import { useAuthStore } from "@/store/authStore";
import { Match } from "@/types/Match";
import { Session } from "@/types/Session";
import React, { useEffect, useState } from "react";
import SessionRequestModel from "@/components/SessionRequestModel";



const Dashboard: React.FC = () => {
const user = useAuthStore((state) => state.user);   // Get logged in user
const [matches, setMatches] = useState<Match[]>([]);
const [sessions, setSessions] = useState<Session[]>([]);
const [loading, setLoading] = useState(true);
const [busy, setBusy] = useState<string | null>(null);
const [requestOpen, setRequestOpen] = useState(false);
const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch mutual matches for the user
            const matchesData: Match[] = await getMutualMatches();
            setMatches(matchesData);

            // Fetch sessions for the user
            const sessionsData: Session[] = await getUserSessions();
            setSessions(sessionsData);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [user]);

if (loading) return <p className="text-center mt-10">Loading...</p>

return (
    <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>

        {/* Matches Section */}
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Skill Matches</h2>
            {matches.length === 0 ? (
                <p>No matches found.</p>
            ) : (
                <ul className="space-y-2">
                    {matches.map((match) => (
                        <li key={match._id} className="p-4 border rounded shadow-sm">
                            <h3 className="font-semibold">{match.name}</h3>
                            <p className="text-sm text-gray-600">{match.email}</p>
                            <div className="mt-2">
                                <p className="text-sm">
                                    <span className="font-medium">Can teach:</span>{" "}
                                    {match.skillsOffered.map((s) => s.skill).join(", ")}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Wants to learn:</span>{" "}
                                    {match.skillsWanted.map((s) => s.skill).join(", ")}
                                </p>
                            </div>
                            <button
                              className="mt-3 rounded bg-blue-600 px-3 py-1 text-white"
                              onClick={() => { setSelectedMatch(match); setRequestOpen(true); }}
                            >
                              Request Session
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>

        {/* Sessions Section */}
        <section>
        <h2 className="text-2xl font-semibold mb-4">Your Sessions</h2>
        {sessions.length === 0 ? (
          <p>No sessions found.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => {
              const partner = user && session.fromUser._id === user._id ? session.toUser : session.fromUser;
              const durationLabel = session.durationMinutes === 30
                ? '30 minutes'
                : session.durationMinutes === 60
                ? '1 hour'
                : session.durationMinutes === 90
                ? '1.5 hours'
                : session.durationMinutes === 120
                ? '2 hours'
                : undefined;
              return (
              <li key={session._id} className="p-4 border rounded shadow-sm">
                <div className="flex flex-col gap-1">
                  <div>
                    <span className="font-medium">Session with</span> {partner.name} — <span className="font-medium">Status:</span> {session.status}
                  </div>
                  <div className="text-sm text-gray-700">
                    {session.message && (
                      <div><span className="font-medium">Message:</span> {session.message}</div>
                    )}
                    <div>
                      <span className="font-medium">Availability:</span> {session.availability ?? '—'}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {durationLabel ?? '—'}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {user && session.status === 'pending' && session.toUser._id === user._id && (
                    <>
                      <button
                        className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50"
                        disabled={busy === session._id}
                        onClick={async () => {
                          setBusy(session._id);
                          try {
                            await updateSessionStatus(session._id, 'accepted');
                            const data = await getUserSessions();
                            setSessions(data);
                          } finally {
                            setBusy(null);
                          }
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
                        disabled={busy === session._id}
                        onClick={async () => {
                          setBusy(session._id);
                          try {
                            await updateSessionStatus(session._id, 'rejected');
                            const data = await getUserSessions();
                            setSessions(data);
                          } finally {
                            setBusy(null);
                          }
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {user && session.status === 'pending' && session.fromUser._id === user._id && (
                    <button
                      className="rounded bg-gray-600 px-3 py-1 text-white disabled:opacity-50"
                      disabled={busy === session._id}
                      onClick={async () => {
                        setBusy(session._id);
                        try {
                          await updateSessionStatus(session._id, 'cancelled');
                          const data = await getUserSessions();
                          setSessions(data);
                        } finally {
                          setBusy(null);
                        }
                      }}
                    >
                      Cancel
                    </button>
                  )}

                  {user && session.status === 'accepted' && (session.fromUser._id === user._id || session.toUser._id === user._id) && (
                    <button
                      className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                      disabled={busy === session._id}
                      onClick={async () => {
                        setBusy(session._id);
                        try {
                          await updateSessionStatus(session._id, 'completed');
                          const data = await getUserSessions();
                          setSessions(data);
                        } finally {
                          setBusy(null);
                        }
                      }}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </li>
            );})}
          </ul>
        )}
      </section> 
      {requestOpen && selectedMatch && (
        <SessionRequestModel
          open={requestOpen}
          match={selectedMatch}
          onClose={() => setRequestOpen(false)}
          onSubmit={async (data) => {
            await createSession(data);
            const sessionsData: Session[] = await getUserSessions();
            setSessions(sessionsData);
            setRequestOpen(false);
          }}
        />
      )}
    </div>
)

}


export default Dashboard;
