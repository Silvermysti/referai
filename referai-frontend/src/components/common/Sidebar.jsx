const navByRole = {
  employee: [
    { id: "opportunities", label: "Opportunities", hint: "Find referrers for a role" },
    { id: "jobs",          label: "Browse Jobs",   hint: "Search job listings" },
    { id: "profile",       label: "Profile",       hint: "Skills, resume, preferences" },
  ],
};

const Sidebar = ({ setPage, currentPage, user }) => {
  const navItems = navByRole[user?.role] || navByRole.employee;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-app bg-[var(--surface)] px-4 py-6 lg:flex lg:flex-col">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-xs font-black text-white">
          R
        </div>
        <div>
          <p className="text-sm font-black tracking-tight text-main">ReferAI</p>
          <p className="text-[10px] text-muted">Referral intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`group relative w-full rounded-lg px-3 py-2.5 text-left transition-all ${
                active
                  ? "bg-[rgb(from_var(--primary)_r_g_b_/_0.1)] text-main"
                  : "text-muted hover:bg-[var(--surface-soft)] hover:text-main"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-[var(--primary)]" />
              )}
              <span className={`block text-sm font-black ${active ? "text-[var(--primary)]" : ""}`}>
                {item.label}
              </span>
              <span className="mt-0.5 block text-[10px] text-muted">{item.hint}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
            style={{ background: `hsl(${[...(user?.name || "U")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 60%, 50%)` }}
          >
            {(user?.name || "U")[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-main">{user?.name || "Student"}</p>
            <p className="truncate text-[10px] text-muted">{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
