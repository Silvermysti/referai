import Header from "./Header";
import Sidebar from "./Sidebar";

const mobileItemsByRole = {
  employee: [
    ["opportunities", "Opportunities"],
    ["jobs",          "Browse Jobs"],
    ["profile",       "Profile"],
  ],
};

const Layout = ({ children, setPage, currentPage, user, onLogout, theme, onSetTheme }) => {
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
            onSetTheme={onSetTheme}
          />

          {/* Mobile nav */}
          <div className="border-b border-app bg-[var(--surface)] px-4 py-2 lg:hidden">
            <div className="flex gap-1.5 overflow-x-auto">
              {(mobileItemsByRole[user?.role] || mobileItemsByRole.employee).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-black transition ${
                    currentPage === id
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-soft)] text-muted hover:text-main"
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
