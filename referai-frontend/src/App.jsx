import { useEffect, useState } from "react";
import Layout from "./components/common/Layout";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Student from "./pages/Student";

const DARK_THEMES = new Set(["dark", "midnight", "violet"]);

function App() {
  const [view, setView] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [page, setPage] = useState("opportunities");
  const [pendingJobDesc, setPendingJobDesc] = useState("");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("referai-theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    // Remove all known theme classes then apply new one
    root.classList.remove("light", "dark", "midnight", "violet", "sand", "forest");
    root.classList.add(theme);
    // Keep Tailwind's `dark` class in sync so dark: variants work
    root.classList.toggle("dark", DARK_THEMES.has(theme));
    localStorage.setItem("referai-theme", theme);
  }, [theme]);

  const openAuth = (mode) => { setAuthMode(mode); setView("auth"); };

  const handleAuth = (account) => {
    setUser(account);
    setPage("opportunities");
    setView("app");
  };

  const handleUserUpdate = (updatedUser) => setUser(updatedUser);

  const logout = () => { setUser(null); setView("landing"); };

  if (view === "landing") {
    return <Landing onAuth={openAuth} theme={theme} onToggleTheme={() => setTheme((t) => DARK_THEMES.has(t) ? "light" : "dark")} />;
  }

  if (view === "auth") {
    return (
      <Auth
        mode={authMode}
        onSubmit={handleAuth}
        onBack={() => setView("landing")}
        theme={theme}
        onToggleTheme={() => setTheme((t) => DARK_THEMES.has(t) ? "light" : "dark")}
      />
    );
  }

  return (
    <Layout
      setPage={setPage}
      currentPage={page}
      user={user}
      onLogout={logout}
      theme={theme}
      onSetTheme={setTheme}
    >
      <div className={page === "opportunities" ? "" : "hidden"}>
        <Student user={user} pendingJobDesc={pendingJobDesc} onClearPendingJobDesc={() => setPendingJobDesc("")} />
      </div>
      <div className={page === "jobs" ? "" : "hidden"}>
        <Jobs user={user} onFindReferrer={(desc) => { setPendingJobDesc(desc); setPage("opportunities"); }} />
      </div>
      <div className={page === "profile" ? "" : "hidden"}>
        <Profile user={user} onUserUpdate={handleUserUpdate} />
      </div>
    </Layout>
  );
}

export default App;
