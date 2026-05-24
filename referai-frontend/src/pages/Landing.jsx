const Landing = ({ onAuth, theme, onToggleTheme }) => {
  return (
    <div className="page-bg">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
            R
          </span>
          <span className="text-lg font-black tracking-tight text-main">ReferAI</span>
        </button>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-muted md:flex">
          <a href="#product" className="hover:text-main">Product</a>
          <a href="#teams" className="hover:text-main">Teams</a>
          <a href="#pricing" className="hover:text-main">Pricing</a>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onToggleTheme} className="btn-secondary px-3 py-2 text-sm" aria-label="Toggle theme">
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button onClick={() => onAuth("login")} className="hidden px-4 py-2 text-sm font-bold text-main sm:block">
            Log in
          </button>
          <button onClick={() => onAuth("signup")} className="btn-primary px-4 py-2 text-sm">
            Sign up
          </button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-10 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 w-fit rounded-full border border-app px-3 py-1 text-sm font-bold text-muted">
              Referrals that start with proof
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-main md:text-7xl">
              The hiring network for verified employee talent.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              ReferAI matches employees to referrers and recruiters, validates proof-of-work, and gives hiring teams a cleaner pipeline of high-intent candidates.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => onAuth("signup")} className="btn-primary px-6 py-4 text-base">
                Create account
              </button>
              <button onClick={() => onAuth("login")} className="btn-secondary px-6 py-4 text-base">
                Log in
              </button>
            </div>
          </div>

          <div className="surface overflow-hidden p-4">
            <div className="rounded-lg border border-app soft p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-main">Stripe Backend Engineer</p>
                  <p className="text-sm text-muted">Referral readiness</p>
                </div>
                <span className="badge badge-green">Ready</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["95", "Match"],
                  ["94%", "Reply"],
                  ["$10", "Reward"],
                ].map(([value, label]) => (
                  <div key={label} className="surface-flat p-4">
                    <p className="text-3xl font-black text-main">{value}</p>
                    <p className="mt-1 text-sm text-muted">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 surface-flat p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-black text-main">Verified candidate</p>
                  <span className="badge badge-blue">Top match</span>
                </div>
                <div className="space-y-3">
                  <Progress label="Distributed systems" value="96%" />
                  <Progress label="API reliability" value="91%" />
                  <Progress label="Network fit" value="94%" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="surface-flat p-4">
                  <p className="text-sm font-black text-main">Best referrer</p>
                  <p className="mt-1 text-sm text-muted">Rahul Subramanian, Staff SWE</p>
                </div>
                <div className="surface-flat p-4">
                  <p className="text-sm font-black text-main">Proof check</p>
                  <p className="mt-1 text-sm text-muted">Payment retry safety verified</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="border-y border-app bg-[var(--surface)]">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-14 md:grid-cols-3 md:px-8">
            <Feature title="Find referrers" body="Rank employees at your target company by how relevant their background is to the role you're applying for." />
            <Feature title="AI-matched outreach" body="Get a tailored message draft and career companion plan based on the job description and your profile." />
            <Feature title="Track requests" body="Send referral requests, track responses, and earn rewards when referrals convert." />
          </div>
        </section>

        <section id="teams" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-muted">Built for trust</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-main">A cleaner path from application to conversation.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Skill evidence", "Alumni routing", "Referral incentives", "Match analytics"].map((item) => (
                <div key={item} className="surface-flat p-5">
                  <p className="font-black text-main">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">Designed to reduce noise while keeping the process transparent.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
          <div className="surface flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-muted">Launch plan</p>
              <h2 className="mt-2 text-3xl font-black text-main">Referral rewards with a small platform fee.</h2>
            </div>
            <button onClick={() => onAuth("signup")} className="btn-primary px-6 py-4">
              Start now
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

const Progress = ({ label, value }) => (
  <div>
    <div className="mb-1 flex justify-between text-sm">
      <span className="font-semibold text-muted">{label}</span>
      <span className="font-black text-main">{value}</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]">
      <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: value }} />
    </div>
  </div>
);

const Feature = ({ title, body }) => (
  <div className="surface-flat p-6">
    <h3 className="text-xl font-black text-main">{title}</h3>
    <p className="mt-3 leading-7 text-muted">{body}</p>
  </div>
);

export default Landing;
