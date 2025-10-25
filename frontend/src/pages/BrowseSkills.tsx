import { Navbar } from "@/components/Navbar";
import SessionRequestModel from "@/components/SessionRequestModel";
import FiltersBar from "@/components/FiltersBar";
import UserCard from "@/components/UserCard";
import { browseUsers, BrowseUsersQuery } from "@/services/userService";
import { createSession } from "@/services/sessionService";
import { User } from "@/types/User";
import { useEffect, useState } from "react";
import { Match } from "@/types/Match";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

export const BrowseSkills = () => {
  const [filters, setFilters] = useState<BrowseUsersQuery>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selected, setSelected] = useState<User|null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authUser = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    setLoading(true);
    browseUsers(filters).then(setUsers).finally(() => setLoading(false));
  }, [filters]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const next: BrowseUsersQuery = {};
    const search = params.get('search') || undefined;
    const category = params.get('category') || undefined;
    const skill = params.get('skill') || undefined;
    if (search) next.search = search;
    if (category) next.category = category;
    if (skill) next.skill = skill;
    if (Object.keys(next).length) setFilters(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync when filters change
  useEffect(() => {
    const sp = createSearchParams({
      ...(filters.search ? { search: String(filters.search) } : {}),
      ...(filters.category ? { category: String(filters.category) } : {}),
      ...(filters.skill ? { skill: String(filters.skill) } : {}),
    }).toString();
    navigate({ pathname: '/browse', search: sp ? `?${sp}` : '' }, { replace: true });
  }, [filters, navigate]);

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
              className="rounded border px-3 py-2 text-sm"
            >
              Filters
            </button>
          </div>
          <div className="mb-4">
            <input className="w-full rounded border px-4 py-2" placeholder="Search skills or keywords..." value={filters.search ?? ''} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}/>
          </div>
          {loading ? <p>Loading...</p> : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {users.map(user => (
                <UserCard
                  key={user._id}
                  user={user}
                  onRequest={(u) => {
                    if (!authUser) return navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
                    setSelected(u);
                    setRequestOpen(true);
                  }}
                />
              ))}
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
                <button className="rounded border px-2 py-1 text-xs" onClick={() => setFilters({})}>Reset</button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => setFiltersOpen(false)}>Apply</button>
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

