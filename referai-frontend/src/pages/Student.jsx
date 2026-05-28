import { useState, useEffect } from "react";
import {
  createReferralRequest,
  generateMessage,
  getCareerCompanion,
  getJobRecommendations,
  getMatches,
  parseJob,
} from "../services/api";

const Student = ({ user }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [copilot, setCopilot] = useState(null);
  const [requestResult, setRequestResult] = useState(null);
  const [jobConfidence, setJobConfidence] = useState(null);
  const [matchSource, setMatchSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setRecsLoading(true);
    getJobRecommendations(user.id)
      .then((data) => setRecommendations(data.jobs || []))
      .catch(() => {})
      .finally(() => setRecsLoading(false));
  }, [user?.id]);

  const analyzeOpportunity = async () => {
    if (!jobDescription.trim()) {
      setError("Paste a job description to find referrers.");
      return;
    }

    setLoading(true);
    setError("");
    setRequestResult(null);
    setCopilot(null);

    try {
      const parsed = await parseJob(jobDescription);
      const ranked = await getMatches({ jobId: parsed.job.id, job: parsed.job, userId: user?.id });
      setJob(parsed.job);
      setJobConfidence(parsed.confidence);
      setMatches(ranked.matches || []);
      setMatchSource(ranked.source || null);
      setExpandedId(null);

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
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">Paste any job description to rank employees at that company who can give you the best referral.</p>
        </div>

        <div className="surface-flat p-5">
          <label className="text-sm font-black text-main" htmlFor="job-desc">
            Job description
          </label>
          <p className="mt-1 mb-3 text-xs text-muted">
            Copy the full job posting from LinkedIn, Greenhouse, Lever, or anywhere else and paste it here.
          </p>
          <textarea
            id="job-desc"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            className="field min-h-[120px] resize-y"
            placeholder="Paste job description here — role, company, requirements, responsibilities…"
          />
          <button onClick={analyzeOpportunity} disabled={loading} className="btn-primary mt-3 w-full py-3 text-sm">
            {loading ? "Analysing…" : "Find referrers"}
          </button>
          {error && <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>}
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
          {matches.length > 0 && matchSource && (
            <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <span>{matches.length} result{matches.length !== 1 ? "s" : ""}</span>
              <span>·</span>
              {matchSource === "github" ? (
                <span className="flex items-center gap-1 text-[var(--primary)]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                  Live from GitHub
                </span>
              ) : matchSource === "snippet" || matchSource === "ai" ? (
                <span className="flex items-center gap-1 text-violet-600">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4v4l3 3"/></svg>
                  AI suggested
                </span>
              ) : matchSource === "seed" ? (
                <span className="text-amber-600">From database</span>
              ) : null}
            </div>
          )}
          {matches.map((employee) => {
            const currentYear = new Date().getFullYear();
            const isStudent = (employee.education || []).some(
              (e) => e.graduation_year && parseInt(e.graduation_year) > currentYear
            );
            const userSkillsLower = new Set((user?.skills || []).map((s) => s.toLowerCase()));
            const commonSkills = (employee.skills || []).filter((s) => userSkillsLower.has(s.toLowerCase()));
            const isExpanded = expandedId === employee.id;

            return (
              <div key={employee.id} className={`surface-flat w-full text-left transition hover:-translate-y-0.5 ${selected?.id === employee.id ? "ring-2 ring-[var(--primary)]" : ""}`}>
                <button
                  className="w-full p-5 text-left"
                  onClick={() => selectEmployee(employee)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-main">{employee.name}</h3>
                      <p className="mt-1 text-sm text-muted">{employee.role} · {employee.department}</p>
                      <p className="mt-1 text-xs font-bold text-muted">
                        {isStudent ? "Student" : employee.seniority}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="rounded-lg bg-[rgb(33_85_217_/_0.12)] px-3 py-2 text-center">
                        <p className="text-xs font-bold text-[var(--primary)]">Match</p>
                        <p className="text-2xl font-black text-[var(--primary-strong)]">{employee.match_score}%</p>
                      </div>
                      {isStudent && <span className="badge badge-blue">Student</span>}
                      {employee.is_connected && <span className="badge badge-green">Connected</span>}
                      {employee.is_alumni && <span className="badge badge-amber">Alumni{employee.shared_college ? ` · ${employee.shared_college}` : ""}</span>}
                      {employee.is_coworker && <span className="badge badge-purple">Coworker{employee.shared_company ? ` · ${employee.shared_company}` : ""}</span>}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(employee.skills || []).slice(0, 5).map((skill) => (
                      <span key={skill} className={`badge ${userSkillsLower.has(skill.toLowerCase()) ? "badge-green" : "badge-blue"}`}>{skill}</span>
                    ))}
                  </div>
                </button>

                {commonSkills.length > 0 && (
                  <div className="border-t border-app px-5 pb-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-3 text-xs font-bold text-muted hover:text-main"
                      onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : employee.id); }}
                    >
                      <span>{commonSkills.length} skill{commonSkills.length !== 1 ? "s" : ""} in common</span>
                      <span className="text-base leading-none">{isExpanded ? "▲" : "▼"}</span>
                    </button>
                    {isExpanded && (
                      <div className="pb-4">
                        <div className="flex flex-wrap gap-2">
                          {commonSkills.map((skill) => (
                            <span key={skill} className="badge badge-green">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(employee.github_url || employee.linkedin_url || employee.email) && (
                  <div className="flex flex-wrap gap-2 border-t border-app px-5 py-3">
                    {employee.github_url && (
                      <a
                        href={employee.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 rounded-md bg-[var(--surface-2)] px-2.5 py-1 text-xs font-bold text-muted hover:text-main"
                      >
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                        GitHub
                      </a>
                    )}
                    {employee.linkedin_url && (
                      <a
                        href={employee.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 rounded-md bg-[var(--surface-2)] px-2.5 py-1 text-xs font-bold text-muted hover:text-main"
                      >
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                      </a>
                    )}
                    {employee.email && (
                      <a
                        href={`mailto:${employee.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 rounded-md bg-[var(--surface-2)] px-2.5 py-1 text-xs font-bold text-muted hover:text-main"
                      >
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        {employee.email}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.linkedin_url && (
                  <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2 text-sm">
                    LinkedIn
                  </a>
                )}
                {selected.github_url && (
                  <a href={selected.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2 text-sm">
                    GitHub
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="btn-secondary px-4 py-2 text-sm">
                    {selected.email}
                  </a>
                )}
              </div>
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
                Paste a job description to see matching referrers at that company.
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Recommended Jobs */}
      {(recsLoading || recommendations.length > 0) && (
        <section className="mt-8">
          <h3 className="mb-4 text-xl font-black text-main">Recommended for you</h3>
          {recsLoading ? (
            <p className="text-sm text-muted">Finding jobs that match your profile…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((rec) => (
                <div key={rec.job_id} className="surface-flat flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    {rec.company_logo ? (
                      <img src={rec.company_logo} alt={rec.company} className="h-9 w-9 rounded object-contain" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded bg-[var(--surface-soft)] text-xs font-black text-muted">
                        {rec.company?.[0] || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-main">{rec.title}</p>
                      <p className="truncate text-xs text-muted">{rec.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs text-muted">
                    {rec.location && <span>📍 {rec.location}</span>}
                    {rec.work_arrangement && <span className="capitalize">· {rec.work_arrangement}</span>}
                    {rec.seniority && <span className="capitalize">· {rec.seniority}</span>}
                  </div>

                  {(rec.min_salary || rec.max_salary) && (
                    <p className="text-xs font-bold text-emerald-600">
                      ${rec.min_salary?.toLocaleString()} – ${rec.max_salary?.toLocaleString()}
                      {rec.salary_period === "YEAR" ? "/yr" : ""}
                    </p>
                  )}

                  {rec.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.skills.slice(0, 5).map((s) => (
                        <span key={s} className="rounded bg-[var(--surface-soft)] px-2 py-0.5 text-xs text-muted">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex gap-2">
                    <a
                      href={rec.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex-1 py-2 text-center text-xs"
                    >
                      Apply
                    </a>
                    <button
                      className="btn-secondary px-3 py-2 text-xs"
                      onClick={() => {
                        setJobDescription(
                          `${rec.title} at ${rec.company}\n\n${rec.description}`
                        );
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Find referrer
                    </button>
                  </div>
                  {rec.posted_at && <p className="text-[10px] text-muted">Posted {rec.posted_at}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Student;
