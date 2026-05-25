const pageTitles = {
  opportunities: "Opportunities",
  profile: "Profile",
};

const Header = ({ currentPage, user, onLogout, theme, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-app bg-[var(--surface)]/90 px-4 backdrop-blur md:px-8">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-muted">ReferAI</p>
        <h1 className="text-base font-black text-main md:text-lg">{pageTitles[currentPage]}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onToggleTheme} className="btn-secondary px-3 py-2 text-sm">
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-black text-main">{user?.name || "User"}</p>
          <p className="text-xs capitalize text-muted">{user?.role || "employee"}</p>
        </div>
        <button onClick={onLogout} className="btn-secondary px-3 py-2 text-sm">
          Log out
        </button>
      </div>
    </header>
  );
};

export default Header;
