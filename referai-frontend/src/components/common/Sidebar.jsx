const navByRole = {
  employee: [{ id: "opportunities", label: "Opportunities", hint: "Find referrers for your target role" }],
};

const Sidebar = ({ setPage, currentPage, user }) => {
  const isActive = (pageName) => currentPage === pageName;
  const navItems = navByRole[user?.role] || navByRole.employee;

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-app bg-[var(--surface)] px-5 py-6 lg:flex lg:flex-col">
      <div className="mb-8">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
          R
        </div>
        <h2 className="text-xl font-black tracking-tight text-main">ReferAI</h2>
        <p className="mt-1 text-sm leading-5 text-muted">Referral intelligence for modern hiring.</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full rounded-lg px-4 py-3 text-left transition ${
              isActive(item.id)
                ? "bg-[var(--text)] text-[var(--bg)] shadow-sm"
                : "text-muted hover:bg-[var(--surface-soft)] hover:text-main"
            }`}
          >
            <span className="block text-sm font-black">{item.label}</span>
            <span className={`mt-1 block text-xs ${isActive(item.id) ? "opacity-75" : "text-faint"}`}>
              {item.hint}
            </span>
          </button>
        ))}
      </nav>

      <div className="surface-flat p-4">
        <p className="text-sm font-black text-main">Your workspace</p>
        <p className="mt-1 text-sm leading-6 text-muted">Find real employees, send referral requests, and track your progress.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
