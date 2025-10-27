import { Navbar } from "@/components/Navbar";
import UserCard from "@/components/UserCard";
import SessionRequestModel from "@/components/SessionRequestModel";
import { createSession } from "@/services/sessionService";
import { getMutualMatchesPaged } from "@/services/matchService";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Match } from "@/types/Match";
import { useEffect, useState } from "react";

const Matches: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [result, setResult] = useState<{ data: Match[]; page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selected, setSelected] = useState<Match | null>(null);
  const authUser = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    setLoading(true);
    getMutualMatchesPaged({ page, limit })
      .then(setResult)
      .catch(() => addToast({ type: 'error', message: 'Failed to load matches' }))
      .finally(() => setLoading(false));
  }, [page, limit, addToast]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your Matches</h1>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(result?.data ?? []).map((u) => (
              <UserCard
                key={u._id}
                user={u}
                onRequest={(clicked) => {
                  if (!authUser) return;
                  setSelected(clicked);
                  setRequestOpen(true);
                }}
                className=""
              />
            ))}
          </div>
        )}

        {result && result.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={!result.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <span className="text-sm">Page {result.page} of {result.totalPages}</span>
            <button className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={!result.hasNext} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </main>

      {requestOpen && selected && (
        <SessionRequestModel
          open={requestOpen}
          match={selected}
          onClose={() => setRequestOpen(false)}
          onSubmit={async (data) => {
            await createSession(data);
            addToast({ type: 'success', message: 'Request sent' });
            setRequestOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Matches;

