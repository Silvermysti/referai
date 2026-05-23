import { useEffect, useState } from "react";
import Layout from "./components/common/Layout";
import Auth from "./pages/Auth";
import Employee from "./pages/Employee";
import Landing from "./pages/Landing";
import Recruiter from "./pages/Recruiter";
import Student from "./pages/Student";

const roleToPage = {
  student: "opportunities",
  employee: "opportunities",
  recruiter: "recruiter",
};

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
    setPage(roleToPage[account.role] || "opportunities");
    setView("app");
  };

  const logout = () => {
    setUser(null);
    setView("landing");
  };

  const renderPage = () => {
    if (page === "reviews") return <Employee />;
    if (page === "recruiter") return <Recruiter user={user} />;
    return <Student user={user} />;
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
      {renderPage()}
    </Layout>
  );
}

export default App;
