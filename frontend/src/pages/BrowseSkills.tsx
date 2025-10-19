import { Navbar } from "@/components/Navbar";
import SessionRequestModel from "@/components/SessionRequestModel";
import FiltersBar from "@/components/FiltersBar";
import UserCard from "@/components/UserCard";
import { browseUsers, BrowseUsersQuery } from "@/services/userService";
import { createSession } from "@/services/sessionService";
import { User } from "@/types/User";
import { useEffect, useState } from "react";
import { Match } from "@/types/Match";

export const BrowseSkills = () => {
  const [filters, setFilters] = useState<BrowseUsersQuery>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selected, setSelected] = useState<User|null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    browseUsers(filters).then(setUsers).finally(() => setLoading(false));
  }, [filters]);

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
                <UserCard key={user._id} user={user} onRequest={(u) => { setSelected(u); setRequestOpen(true); }} />
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
              <button className="rounded border px-2 py-1 text-xs" onClick={() => setFiltersOpen(false)}>Close</button>
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
            setRequestOpen(false);
          }}
        />
      )}
    </div>
  );
};
