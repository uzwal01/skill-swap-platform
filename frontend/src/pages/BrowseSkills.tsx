import { Navbar } from "@/components/Navbar";
import SessionRequestModel from "@/components/SessionRequestModel";
import FiltersBar from "@/components/FiltersBar";
import UserCard from "@/components/UserCard";
import { browseUsers, BrowseUsersQuery } from "@/services/userService";
import { createSession } from "@/services/sessionService";
import { ensureConversation } from "@/services/messageService";
import { User } from "@/types/User";
import { useEffect, useMemo, useState } from "react";
import { Match } from "@/types/Match";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Paginated } from "@/types/Paginated";
import { isAxiosError } from "axios";

export const BrowseSkills = () => {
  const [filters, setFilters] = useState<BrowseUsersQuery>({});
  const [result, setResult] = useState<Paginated<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [requestOpen, setRequestOpen] = useState(false);
  const [selected, setSelected] = useState<User|null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authUser = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.addToast);
  const pageNumbers = useMemo(() => {
    const total = result?.totalPages ?? 0;
    if (total <= 1) return [] as number[];
    const start = Math.max(1, page - 2);
    const end = Math.min(total, page + 2);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  }, [result?.totalPages, page]);

  useEffect(() => {
    setLoading(true);
    browseUsers({ ...filters, page, limit })
      .then((res) => setResult(res))
      .finally(() => setLoading(false));
  }, [filters, page, limit]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const next: BrowseUsersQuery = {};
    const search = params.get('search') || undefined;
    const category = params.get('category') || undefined;
    const skill = params.get('skill') || undefined;
    const pageParam = params.get('page');
    if (search) next.search = search;
    if (category) next.category = category;
    if (skill) next.skill = skill;
    if (Object.keys(next).length) setFilters(next);
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) setPage(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync when filters change
  useEffect(() => {
    const sp = createSearchParams({
      ...(filters.search ? { search: String(filters.search) } : {}),
      ...(filters.category ? { category: String(filters.category) } : {}),
      ...(filters.skill ? { skill: String(filters.skill) } : {}),
      ...(page ? { page: String(page) } : {}),
    }).toString();
    navigate({ pathname: '/browse', search: sp ? `?${sp}` : '' }, { replace: true });
  }, [filters, page, navigate]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.category, filters.skill]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="mx-auto flex max-w-6xl gap-10 px-4 py-12">
        <aside className="hidden w-64 md:block">
          <FiltersBar value={filters} onChange={setFilters} onReset={() => setFilters({})} />
        </aside>
        <section className="flex-1">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition"
            >
              Filters
            </button>
          </div>
          <div className="mb-4">
            <input className="py-2 px-4 border border-gray-300 rounded-md focus:ring-1 mt-2 w-full focus:ring-blue-300 focus:outline-none" placeholder="Search skills or keywords..." value={filters.search ?? ''} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}/>
          </div>
          {loading ? <p>Loading...</p> : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(result?.data ?? [])
                .filter(u => u._id !== (authUser?._id ?? ''))
                .map(user => (
                <UserCard
                  key={user._id}
                  user={user}
                  onRequest={(u) => {
                    if (!authUser) return navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
                    setSelected(u);
                    setRequestOpen(true);
                  }}
                  onMessage={async (u) => {
                    if (!authUser) return navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
                    try {
                      const conv = await ensureConversation(u._id);
                      navigate(`/profile?tab=messages&conv=${conv._id}`);
                    } catch (err) {
                      const status = isAxiosError(err) ? err.response?.status : undefined;
                      if (status === 403) {
                        addToast({ type: 'error', message: 'Messaging is available after your swap is accepted.' });
                      } else {
                        addToast({ type: 'error', message: 'Unable to start conversation.' });
                      }
                    }
                  }}
                  className="transition-transform hover:-translate-y-1 hover:shadow-lg"
                />
              ))}
            </div>
          )}
          {result && result.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                disabled={!result.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  className={`rounded border px-3 py-1 text-sm ${n === page ? 'bg-black text-white' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                disabled={!result.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
      {/* Mobile Filters Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setFiltersOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Filters</h3>
              <div className="flex gap-2">
                <button className="bg-blue-500 hover:bg-blue-600 text-sm text-white px-2 py-1 rounded-md transition" onClick={() => setFilters({})}>Reset</button>
                <button className="bg-blue-600 hover:bg-blue-500 text-sm text-white px-2 py-1 rounded-md transition" onClick={() => setFiltersOpen(false)}>Apply</button>
              </div>
            </div>
            <FiltersBar value={filters} onChange={setFilters} onReset={() => setFilters({})} />
          </div>
        </div>
      )}
      {requestOpen && selected && (
        <SessionRequestModel
          open={requestOpen}
          match={selected as Match}
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

