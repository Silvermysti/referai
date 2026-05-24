import { useEffect, useState } from "react";
import Layout from "./components/common/Layout";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Student from "./pages/Student";

function App() {
  const [view, setView] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [page, setPage] = useState("opportunities");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("referai-theme") || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("referai-theme", theme);
  }, [theme]);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setView("auth");
  };

  const handleAuth = (account) => {
    setUser(account);
    setPage("opportunities");
    setView("app");
  };

  const logout = () => {
    setUser(null);
    setView("landing");
  };

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  if (view === "landing") {
    return <Landing onAuth={openAuth} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (view === "auth") {
    return (
      <Auth
        mode={authMode}
        onSubmit={handleAuth}
        onBack={() => setView("landing")}
        theme={theme}
        onToggleTheme={toggleTheme}
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
      onToggleTheme={toggleTheme}
    >
      <Student user={user} />
    </Layout>
  );
}

export default App;
