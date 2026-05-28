const PAGE_TITLES = {
  opportunities: "Find Referrers",
  jobs:          "Browse Jobs",
  profile:       "Profile",
};

const THEMES = [
  { id: "light",    label: "Light",    color: "#4f46e5" },
  { id: "sand",     label: "Sand",     color: "#d97706" },
  { id: "forest",   label: "Forest",   color: "#059669" },
  { id: "dark",     label: "Dark",     color: "#818cf8" },
  { id: "midnight", label: "Midnight", color: "#89b4fa" },
  { id: "violet",   label: "Violet",   color: "#c4b5fd" },
];

const Header = ({ currentPage, user, onLogout, theme, onSetTheme }) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-app bg-[var(--surface)]/90 px-4 backdrop-blur md:px-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">ReferAI</p>
        <h1 className="text-sm font-black text-main md:text-base">{PAGE_TITLES[currentPage] ?? currentPage}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme swatches */}
        <div className="flex items-center gap-1.5" title="Switch theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSetTheme(t.id)}
              title={t.label}
              className="h-4 w-4 rounded-full transition-transform hover:scale-125"
              style={{
                background: t.color,
                boxShadow: theme === t.id
                  ? `0 0 0 2px var(--bg), 0 0 0 3.5px ${t.color}`
                  : "none",
              }}
            />
          ))}
        </div>

        <div className="h-4 w-px bg-[var(--border)]" />

        {/* User info */}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-black text-main leading-tight">{user?.name || "User"}</p>
          <p className="text-[10px] capitalize text-muted">{user?.role || "student"}</p>
        </div>

        <button onClick={onLogout} className="btn-secondary px-3 py-1.5 text-xs">
          Sign out
        </button>
      </div>
    </header>
  );
};

export default Header;
