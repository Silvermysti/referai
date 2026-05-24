import { useState } from "react";
import { authLogin, authSignup, startPhoneAuth } from "../services/api";

const Auth = ({ mode, onSubmit, onBack, theme, onToggleTheme }) => {
  const [authMode, setAuthMode] = useState(mode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
    role: "employee",
    linkedin_url: "",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = authMode === "signup";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);
    try {
      const response = isSignup ? await authSignup(form) : await authLogin(form);
      onSubmit(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError("");
    setStatus("");
    try {
      const response = await startPhoneAuth({ phone: form.phone });
      setStatus(response.message || "OTP sent.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-bg flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <button onClick={onBack} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
            R
          </span>
          <span className="text-lg font-black tracking-tight text-main">ReferAI</span>
        </button>
        <button onClick={onToggleTheme} className="btn-secondary px-3 py-2 text-sm">
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden surface lg:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden border-r border-app soft p-10 lg:block">
            <p className="text-sm font-black uppercase tracking-wide text-muted">Welcome</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-main">
              Build referrals around proof, not cold messages.
            </h1>
            <div className="mt-8 space-y-4">
              {["Smart matching", "Verified referrers", "Referral tracking"].map((item) => (
                <div key={item} className="surface-flat p-4">
                  <p className="font-black text-main">{item}</p>
                  <p className="mt-1 text-sm text-muted">Available after login.</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            <p className="text-sm font-black uppercase tracking-wide text-muted">
              {isSignup ? "Create account" : "Log in"}
            </p>
            <h2 className="mt-3 text-3xl font-black text-main">
              {isSignup ? "Start using ReferAI" : "Welcome back"}
            </h2>

            <div className="mt-8 space-y-4">
              {isSignup && (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-main">Full name</span>
                  <input
                    className="field"
                    value={form.name}
                    placeholder="Enter your name"
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-main">Email</span>
                <input
                  className="field"
                  type="email"
                  value={form.email}
                  placeholder="you@example.com"
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-main">Password</span>
                <input
                  className="field"
                  type="password"
                  value={form.password}
                  placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </label>


              {isSignup && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-main">LinkedIn profile</span>
                    <input
                      className="field"
                      value={form.linkedin_url}
                      placeholder="linkedin.com/in/your-profile"
                      onChange={(event) => setForm({ ...form, linkedin_url: event.target.value })}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-main">Phone number</span>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        className="field"
                        value={form.phone}
                        placeholder="+919876543210"
                        onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      />
                      <button type="button" onClick={sendOtp} className="btn-secondary px-4 py-3 text-sm">
                        Send OTP
                      </button>
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-main">Phone OTP</span>
                    <input
                      className="field"
                      value={form.otp}
                      placeholder="Enter OTP"
                      onChange={(event) => setForm({ ...form, otp: event.target.value })}
                    />
                  </label>
                </>
              )}

            </div>

            {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
            {status && <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{status}</p>}

            <button disabled={loading} className="btn-primary mt-6 w-full px-5 py-4">
              {loading ? "Checking" : isSignup ? "Create account" : "Log in"}
            </button>

            <p className="mt-6 text-center text-sm text-muted">
              {isSignup ? "Already have an account?" : "New to ReferAI?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStatus("");
                  setAuthMode(isSignup ? "login" : "signup");
                }}
                className="font-black text-[var(--primary)]"
              >
                {isSignup ? "Log in" : "Create one"}
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Auth;
