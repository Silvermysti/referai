import Header from "./Header";
import Sidebar from "./Sidebar";

const mobileItemsByRole = {
  employee: [["opportunities", "Jobs"], ["profile", "Profile"]],
};

const Layout = ({ children, setPage, currentPage, user, onLogout, theme, onToggleTheme }) => {
  return (
    <div className="page-bg">
      <div className="flex min-h-screen">
        <Sidebar setPage={setPage} currentPage={currentPage} user={user} />

        <div className="min-w-0 flex-1">
          <Header
            currentPage={currentPage}
            user={user}
            onLogout={onLogout}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />

          <div className="border-b border-app bg-[var(--surface)] px-4 py-3 lg:hidden">
            <div className="grid gap-2">
              {(mobileItemsByRole[user?.role] || mobileItemsByRole.employee).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  className={`rounded-lg px-3 py-2 text-xs font-black ${
                    currentPage === id ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface-soft)] text-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
