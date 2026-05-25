import { useState } from "react";
import {
  createReferralRequest,
  generateMessage,
  getCareerCompanion,
  getMatches,
  parseJob,
} from "../services/api";

const Student = ({ user }) => {
  const [jobUrl, setJobUrl] = useState("");
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [copilot, setCopilot] = useState(null);
  const [requestResult, setRequestResult] = useState(null);
  const [jobConfidence, setJobConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeOpportunity = async () => {
    if (!jobUrl.trim()) {
      setError("Enter a job link to search.");
      return;
    }

    setLoading(true);
    setError("");
    setRequestResult(null);
    setCopilot(null);

    try {
      const parsed = await parseJob(jobUrl);
      const ranked = await getMatches({ jobId: parsed.job.id, job: parsed.job, userId: user?.id });
      setJob(parsed.job);
      setJobConfidence(parsed.confidence);
      setMatches(ranked.matches || []);

      const firstEmployee = ranked.matches?.[0] || null;
      setSelected(firstEmployee);

      if (firstEmployee) {
        loadEmployeeDetails(firstEmployee, parsed.job);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeDetails = async (employee, currentJob) => {
    const targetJob = currentJob || job;
    setDetailLoading(true);
    try {
      const [aiPlan, intro] = await Promise.all([
        getCareerCompanion({ userId: user?.id, jobId: targetJob.id, job: targetJob, profile: user }),
        generateMessage({ userId: user?.id, employeeId: employee.id, jobId: targetJob.id, job: targetJob }),
      ]);
      setCopilot(aiPlan.copilot);
      setMessage(intro.message);
    } catch {
      setMessage(buildFallbackMessage(targetJob, employee, user));
    } finally {
      setDetailLoading(false);
    }
  };

  const selectEmployee = async (employee) => {
    setSelected(employee);
    setRequestResult(null);
    setCopilot(null);
    setMessage("");
    await loadEmployeeDetails(employee, job);
  };

  const requestReferral = async () => {
    if (!selected || !job) return;
    try {
      const response = await createReferralRequest({
        userId: user?.id,
        employeeId: selected.id,
        jobId: job.id,
        job,
        message,
      });
      setRequestResult(response.request);
    } catch (err) {
      setError(err.message);
    }
  };

  const buildFallbackMessage = (liveJob, employee, account) =>
    `Hi ${employee?.name || ""},\n\nI am applying for the ${liveJob?.role || "role"} at ${liveJob?.company || "your company"}.\n\nMy key skills include ${(account?.skills || []).slice(0, 3).join(", ") || "relevant experience"}. Would you be open to a quick chat or a referral?\n\nThanks,\n${account?.name || ""}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <section className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.75fr)]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-main md:text-5xl">Find the right referrer.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">Paste a role link to rank employees at that company who can refer you.</p>
        </div>

        <div className="surface-flat p-5">
          <label className="text-sm font-black text-main" htmlFor="job-url">
            Job link
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="job-url"
              value={jobUrl}
              onChange={(event) => setJobUrl(event.target.value)}
              className="field"
              placeholder="Job URL"
            />
            <button onClick={analyzeOpportunity} disabled={loading} className="btn-primary min-h-11 px-5 text-sm">
              {loading ? "Searching" : "Search"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>}
          <p className="mt-3 text-xs font-bold text-muted">Reads the page when possible; blocked pages use the URL.</p>
        </div>
      </section>

      {job && (
        <section className="surface-flat mb-6 p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black text-main">
                {job.role} at {job.company}
              </p>
              <p className="mt-1 text-sm text-muted">
                {job.location} {job.level && job.level !== "Not specified" ? `· ${job.level}` : ""}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{job.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-muted">
                {jobConfidence && <span>Extraction confidence {Math.round(jobConfidence * 100)}%</span>}
                {job.extraction_notes?.map((note) => (
                  <span key={note}>{note}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="badge badge-blue">{skill}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`grid gap-6 ${matches.length ? "xl:grid-cols-[0.9fr_1.1fr]" : ""}`}>
        <div className="space-y-4">
          {matches.map((employee) => (
            <button
              key={employee.id}
              onClick={() => selectEmployee(employee)}
              className={`surface-flat w-full p-5 text-left transition hover:-translate-y-0.5 ${
                selected?.id === employee.id ? "ring-2 ring-[var(--primary)]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-main">{employee.name}</h3>
                  <p className="mt-1 text-sm text-muted">{employee.role} · {employee.department}</p>
                  <p className="mt-1 text-xs font-bold text-muted">{employee.seniority}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="rounded-lg bg-[rgb(33_85_217_/_0.12)] px-3 py-2 text-center">
                    <p className="text-xs font-bold text-[var(--primary)]">Match</p>
                    <p className="text-2xl font-black text-[var(--primary-strong)]">{employee.match_score}</p>
                  </div>
                  {employee.is_connected && <span className="badge badge-green">Connected</span>}
                  {employee.is_alumni && <span className="badge badge-amber">Alumni</span>}
                  {employee.is_coworker && <span className="badge badge-purple">Coworker</span>}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(Array.isArray(employee.skills) ? employee.skills : []).slice(0, 5).map((skill) => (
                  <span key={skill} className="badge badge-blue">{skill}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="space-y-6">
            {detailLoading && (
              <div className="surface-flat p-5 text-sm font-bold text-muted">Loading details…</div>
            )}

            {!detailLoading && copilot && (
              <div className="surface-flat p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-muted">AI career companion</p>
                    <h3 className="mt-1 text-xl font-black text-main">{copilot.readiness_score}% launch readiness</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Multi-agent plan for skill building, opportunity access, and proof-led matching.
                    </p>
                  </div>
                  <span className="badge badge-green">AI active</span>
                </div>

                {copilot.llm && (
                  <div className="mt-4 rounded-lg border border-app p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <p className="text-sm font-black text-main">LLM model</p>
                      <span className={`badge ${copilot.llm.active ? "badge-green" : "badge-amber"}`}>
                        {copilot.llm.active ? `${copilot.llm.provider} · ${copilot.llm.model}` : "Offline fallback"}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{copilot.llm_summary}</p>
                  </div>
                )}

                {copilot.agents && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {copilot.agents.map((agent) => (
                      <div key={agent.name} className="rounded-lg border border-app p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-main">{agent.name}</p>
                          <span className="badge badge-blue">{agent.score}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted">{agent.finding}</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-main">{agent.action}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="surface-flat p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-muted">Referrer</p>
                  <h3 className="mt-1 text-xl font-black text-main">{selected.name}</h3>
                  <p className="mt-1 text-sm text-muted">{selected.role} · {selected.company}</p>
                  {selected.bio && <p className="mt-3 text-sm leading-6 text-muted">{selected.bio}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.is_connected && <span className="badge badge-green">Connected</span>}
                    {selected.is_alumni && <span className="badge badge-amber">Alumni · {selected.shared_college}</span>}
                    {selected.is_coworker && <span className="badge badge-purple">Coworker · {selected.shared_company}</span>}
                  </div>
                </div>
                <div className="rounded-lg border border-app px-3 py-2 text-center">
                  <p className="text-xs font-bold text-muted">Reply</p>
                  <p className="text-2xl font-black text-main">{selected.response_probability}%</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Array.isArray(selected.skills) ? selected.skills : []).map((skill) => (
                  <span key={skill} className="badge badge-blue">{skill}</span>
                ))}
              </div>
              {selected.linkedin_url && (
                <a
                  href={selected.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-4 inline-block px-4 py-2 text-sm"
                >
                  View LinkedIn
                </a>
              )}
            </div>

            <div className="surface-flat p-5">
              <p className="text-sm font-black uppercase tracking-wide text-muted">Referral message</p>
              <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                {message}
              </pre>
              <button
                onClick={requestReferral}
                disabled={!message || detailLoading || !!requestResult}
                className="btn-primary mt-4 px-5 py-3 text-sm disabled:opacity-50"
              >
                {requestResult ? "Request sent" : "Request referral"}
              </button>
              {requestResult && (
                <p className="mt-3 rounded-lg soft p-3 text-sm font-black text-main">
                  Request sent to {requestResult.employee?.name || selected.name}. Reward ${requestResult.reward}.
                </p>
              )}
            </div>
          </div>
        ) : !matches.length && job ? (
          <div className="surface-flat empty-state">
            <div>
              <p className="text-lg font-black text-main">No employees found</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                No employees found at this company in the database.
              </p>
            </div>
          </div>
        ) : !job ? (
          <div className="surface-flat empty-state">
            <div>
              <p className="text-lg font-black text-main">No search yet</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                Add a job link to see matching referrers and referral options.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Student;
