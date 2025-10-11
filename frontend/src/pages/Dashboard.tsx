import { getMutualMatches } from "@/services/matchService";
import { getUserSessions } from "@/services/sessionService";
import { useAuthStore } from "@/store/authStore";
import { Match } from "@/types/Match";
import { Session } from "@/types/Session";
import React, { useEffect, useState } from "react";



const Dashboard: React.FC = () => {
const user = useAuthStore((state) => state.user);   // Get logged in user
const [matches, setMatches] = useState<Match[]>([]);
const [sessions, setSessions] = useState<Session[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch mutual matches for the user
            const matchesData: Match[] = await getMutualMatches(user.id);
            setMatches(matchesData);

            // Fetch sessions for the user
            const sessionsData: Session[] = await getUserSessions(user.id);
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
            <h2 className="text-2xl font-semibold mb-4">Yout Skill Matches</h2>
            {matches.length === 0 ? (
                <p>No matches found.</p>
            ) : (
                <ul className="space-y-2">
                    {matches.map((match) => (
                        <li key={match.userId} className="p-4 border rounded shadow-sm">
                            {match.skill} with {match.matchedWith} (Score: {match.matchScore})
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
            {sessions.map((session) => (
              <li key={session.sessionId} className="p-4 border rounded shadow-sm">
                Session with {session.toUser} - Status: {session.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
)

}


export default Dashboard;