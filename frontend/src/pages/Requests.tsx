import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { getUserSessionsPaged, SessionsQuery, updateSessionStatus } from "@/services/sessionService";
import { Session } from "@/types/Session";

const Requests: React.FC = () => {
  const [params, setParams] = useState<SessionsQuery>({ page: 1, limit: 10 });
  const [result, setResult] = useState<{ data: Session[]; page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setLoading(true);
    getUserSessionsPaged(params)
      .then(setResult)
      .catch(() => addToast({ type: 'error', message: 'Failed to load requests' }))
      .finally(() => setLoading(false));
  }, [params, addToast]);

  const act = async (id: string, status: 'accepted' | 'rejected' | 'cancelled' | 'completed') => {
    try {
      setBusyId(id);
      await updateSessionStatus(id, status);
      // refresh current page
      const res = await getUserSessionsPaged(params);
      setResult(res);
    } catch (e) {
      addToast({ type: 'error', message: e instanceof Error ? e.message : 'Failed' });
    } finally {
      setBusyId(null);
    }
  };

  const outgoing = (result?.data || []).filter(s => s.fromUser._id === user?._id);
  const incoming = (result?.data || []).filter(s => s.toUser._id === user?._id);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Swap Requests</h1>
          <div className="flex gap-2 text-sm">
            <select
              className="rounded-lg border text-white bg-blue-400 p-2"
              value={params.type ?? ''}
              onChange={(e) => {
                const val = e.target.value as '' | 'incoming' | 'outgoing';
                setParams((p): SessionsQuery => ({ ...p, page: 1, type: val || undefined }));
              }}
            >
              <option value="">All</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>
            <select
              className="rounded-lg border text-white bg-blue-400 p-2"
              value={params.status ?? ''}
              onChange={(e) => {
                const val = e.target.value as '' | 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
                setParams((p): SessionsQuery => ({ ...p, page: 1, status: val || undefined }));
              }}
            >
              <option value="">Any status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h3 className="mb-3 text-base font-semibold">Outgoing</h3>
            {outgoing.length === 0 ? <p className="text-sm text-gray-500">No outgoing requests.</p> : (
              <ul className="space-y-3 text-sm">
                {outgoing.map((s) => (
                  <li key={s._id} className="rounded-lg border border-blue-200 shadow-sm p-3 bg-white">
                    To <span className="font-medium">{s.toUser.name}</span> - {s.fromUserSkill} - {s.toUserSkill}
                    <div className="text-xs text-gray-500">Status: {s.status}{s.availability ? ' | ' + s.availability : ''}{s.durationMinutes ? ' | ' + s.durationMinutes + ' min' : ''}</div>
                    {s.message && <div className="mt-1 text-gray-700">"{s.message}"</div>}
                    <div className="mt-3 flex gap-2">
                      {s.status === 'pending' && (
                        <button className="rounded bg-gray-600 px-3 py-1 text-white disabled:opacity-50" disabled={busyId === s._id} onClick={() => act(s._id, 'cancelled')}>Cancel</button>
                      )}
                      {s.status === 'accepted' && (
                        <button className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50" disabled={busyId === s._id} onClick={() => act(s._id, 'completed')}>Complete</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mb-3 mt-8 text-base font-semibold">Incoming</h3>
            {incoming.length === 0 ? <p className="text-sm text-gray-500">No incoming requests.</p> : (
              <ul className="space-y-3 text-sm">
                {incoming.map((s) => (
                  <li key={s._id} className="rounded-lg border border-blue-200 shadow-sm p-3 bg-white">
                    From <span className="font-medium">{s.fromUser.name}</span> - {s.fromUserSkill} - {s.toUserSkill}
                    <div className="text-xs text-gray-500">Status: {s.status}{s.availability ? ' | ' + s.availability : ''}{s.durationMinutes ? ' | ' + s.durationMinutes + ' min' : ''}</div>
                    {s.message && <div className="mt-1 text-gray-700">"{s.message}"</div>}
                    <div className="mt-3 flex gap-2">
                      {s.status === 'pending' && (
                        <>
                          <button className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50" disabled={busyId === s._id} onClick={() => act(s._id, 'accepted')}>Accept</button>
                          <button className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50" disabled={busyId === s._id} onClick={() => act(s._id, 'rejected')}>Reject</button>
                        </>
                      )}
                      {s.status === 'accepted' && (
                        <button className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50" disabled={busyId === s._id} onClick={() => act(s._id, 'completed')}>Complete</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {result && result.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button className="rounded-lg border border-blue-500 hover:text-blue-500 transition px-3 py-1 text-sm text-gray-800 disabled:opacity-50 disabled:hover:text-gray-800" disabled={!result.hasPrev} onClick={() => setParams(p => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))}>Prev</button>
                <span className="text-sm">Page {result.page} of {result.totalPages}</span>
                <button className="rounded-lg border border-blue-500 hover:text-blue-500 transition px-3 py-1 text-sm text-gray-800 disabled:opacity-50 disabled:hover:text-gray-800" disabled={!result.hasNext} onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) + 1 }))}>Next</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Requests;
