import { useEffect, useState } from "react";
import {
  createReferralRequest,
  generateMessage,
  getMatches,
  parseJob,
} from "../services/api";

const nameToHue = (name) =>
  [...(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

const Avatar = ({ name, size = "md" }) => {
  const hue = nameToHue(name);
  const sz = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={`${sz} shrink-0 rounded-xl font-black text-white flex items-center justify-center`}
      style={{ background: `hsl(${hue}, 55%, 48%)` }}
    >
      {(name || "?")[0]}
    </div>
  );
};

const SkeletonLine = ({ w = "full" }) => (
  <div className={`h-3 w-${w} rounded bg-[var(--surface-soft)] animate-pulse-soft`} />
);

const Student = ({ user, pendingJobDesc, onClearPendingJobDesc }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [requestResult, setRequestResult] = useState(null);
  const [jobConfidence, setJobConfidence] = useState(null);
  const [matchSource, setMatchSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (pendingJobDesc) {
      setJobDescription(pendingJobDesc);
      onClearPendingJobDesc?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pendingJobDesc]);

  const currentYear = new Date().getFullYear();
  const userSkillsLower = new Set((user?.skills || []).map((s) => s.toLowerCase()));

  const analyzeOpportunity = async () => {
    if (!jobDescription.trim()) { setError("Paste a job description to find referrers."); return; }
    setLoading(true);
    setError("");
    setRequestResult(null);
    try {
      const parsed = await parseJob(jobDescription);
      const ranked = await getMatches({ jobId: parsed.job.id, job: parsed.job, userId: user?.id });
      setJob(parsed.job);
      setJobConfidence(parsed.confidence);
      setMatches(ranked.matches || []);
      setMatchSource(ranked.source || null);
      setExpandedId(null);
      const first = ranked.matches?.[0] || null;
      setSelected(first);
      if (first) loadEmployeeDetails(first, parsed.job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeDetails = async (employee, currentJob) => {
    const targetJob = currentJob || job;
    setDetailLoading(true);
    setMessage("");
    try {
      const intro = await generateMessage({
        userId: user?.id,
        employeeId: employee.id,
        jobId: targetJob.id,
        job: targetJob,
      });
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

  const copyMessage = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const buildFallbackMessage = (liveJob, employee, account) => {
    const firstName = employee?.name?.split(" ")[0] || "there";
    const myName = account?.name?.split(" ")[0] || "";
    const skills = (account?.skills || []).slice(0, 3).join(", ") || "relevant technologies";
    return `Hi ${firstName},

I hope this message finds you well. I came across your profile while researching the ${liveJob?.role || "role"} opening at ${liveJob?.company || "your company"}, and I was genuinely impressed by your work in ${employee?.department || "engineering"}.

I am currently applying for this position and believe my background aligns closely with the team's focus. My core skills include ${skills}, and I am especially excited about the work ${liveJob?.company || "the company"} is doing.

Would you be open to a quick 10-minute chat about your experience there, or to passing along my profile to the hiring team? I would be incredibly grateful for any guidance or support.

Thank you so much for your time!

${account?.name || myName}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">

      {/* Header + input */}
      <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(400px,0.7fr)]">
        <div className="flex flex-col justify-center">
          <h2 className="text-4xl font-black tracking-tight text-main md:text-5xl">
            Find the right<br />referrer.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            Paste any job description — we rank employees at that company by how well they can refer you.
          </p>
        </div>

        <div className="surface-flat overflow-hidden">
          <div className="border-b border-app px-5 py-4">
            <label className="text-sm font-black text-main" htmlFor="job-desc">Job description</label>
            <p className="mt-0.5 text-xs text-muted">LinkedIn, Greenhouse, Lever — paste the full posting.</p>
          </div>
          <div className="p-5">
            <textarea
              id="job-desc"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="field min-h-[110px] resize-y text-sm"
              placeholder="Paste job description here…"
            />
            <button
              onClick={analyzeOpportunity}
              disabled={loading}
              className="btn-primary mt-3 w-full py-3 text-sm font-black"
            >
              {loading ? "Analysing…" : "Find referrers →"}
            </button>
            {error && <p className="mt-3 text-xs font-bold text-rose-500">{error}</p>}
          </div>
        </div>
      </section>

      {/* Parsed job pill */}
      {job && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-app bg-[var(--surface-soft)] px-5 py-4">
          <div>
            <p className="font-black text-main">{job.role} <span className="font-normal text-muted">at</span> {job.company}</p>
            <p className="mt-0.5 text-xs text-muted">
              {[job.location, job.level !== "Not specified" && job.level].filter(Boolean).join(" · ")}
              {jobConfidence && <span className="ml-2 opacity-60">· {Math.round(jobConfidence * 100)}% extraction confidence</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span key={skill} className="badge badge-blue">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Results grid */}
      <section className={`grid gap-6 ${matches.length ? "xl:grid-cols-[1fr_420px]" : ""}`}>

        {/* Left: match list */}
        <div className="space-y-3">
          {matches.length > 0 && matchSource && (
            <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <span>{matches.length} result{matches.length !== 1 ? "s" : ""}</span>
              <span>·</span>
              {matchSource === "github" && (
                <span className="flex items-center gap-1 text-[var(--primary)]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                  Live from GitHub
                </span>
              )}
              {(matchSource === "snippet" || matchSource === "ai") && (
                <span className="text-violet-500">AI suggested</span>
              )}
              {matchSource === "seed" && <span className="text-amber-500">From database</span>}
            </div>
          )}

          {matches.map((emp) => {
            const isStudent = (emp.education || []).some(
              (e) => e.graduation_year && parseInt(e.graduation_year) > currentYear
            );
            const commonSkills = (emp.skills || []).filter((s) => userSkillsLower.has(s.toLowerCase()));
            const isExpanded = expandedId === emp.id;
            const isSelected = selected?.id === emp.id;

            return (
              <div
                key={emp.id}
                className={`surface-flat transition-all hover:-translate-y-0.5 ${
                  isSelected ? "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--bg)]" : ""
                }`}
              >
                <button className="w-full p-4 text-left" onClick={() => selectEmployee(emp)}>
                  <div className="flex items-start gap-3">
                    <Avatar name={emp.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-main">{emp.name}</p>
                          <p className="mt-0.5 text-xs text-muted">{emp.role}{emp.department ? ` · ${emp.department}` : ""}</p>
                          <p className="mt-0.5 text-[10px] font-bold text-faint">
                            {isStudent ? "Student" : emp.seniority}
                          </p>
                        </div>
                        <div className="shrink-0 rounded-lg bg-[rgb(from_var(--primary)_r_g_b_/_0.1)] px-2.5 py-1.5 text-center">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--primary)]">Match</p>
                          <p className="text-xl font-black leading-tight text-[var(--primary-strong)]">{emp.match_score}%</p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {(emp.skills || []).slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className={`badge ${userSkillsLower.has(skill.toLowerCase()) ? "badge-green" : "badge-blue"}`}
                          >
                            {skill}
                          </span>
                        ))}
                        {isStudent && <span className="badge badge-blue">Student</span>}
                        {emp.is_connected && <span className="badge badge-green">Connected</span>}
                        {emp.is_alumni && <span className="badge badge-amber">Alumni</span>}
                      </div>
                    </div>
                  </div>
                </button>

                {commonSkills.length > 0 && (
                  <div className="border-t border-app px-4">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-2.5 text-xs font-bold text-muted hover:text-main"
                      onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : emp.id); }}
                    >
                      <span>{commonSkills.length} shared skill{commonSkills.length !== 1 ? "s" : ""}</span>
                      <span className="text-[var(--faint)]">{isExpanded ? "▲" : "▼"}</span>
                    </button>
                    {isExpanded && (
                      <div className="pb-3 flex flex-wrap gap-1.5">
                        {commonSkills.map((s) => (
                          <span key={s} className="badge badge-green">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(emp.github_url || emp.linkedin_url || emp.email) && (
                  <div className="flex flex-wrap gap-1.5 border-t border-app px-4 py-2.5">
                    {emp.github_url && (
                      <a href={emp.github_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                         className="flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-2 py-1 text-xs font-bold text-muted hover:text-main">
                        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                        GitHub
                      </a>
                    )}
                    {emp.linkedin_url && (
                      <a href={emp.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                         className="flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-2 py-1 text-xs font-bold text-muted hover:text-main">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                      </a>
                    )}
                    {emp.email && (
                      <a href={`mailto:${emp.email}`} onClick={(e) => e.stopPropagation()}
                         className="flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-2 py-1 text-xs font-bold text-muted hover:text-main">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        Email
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: referrer detail + message */}
        {selected ? (
          <div className="space-y-4">
            {/* Referrer card */}
            <div className="surface-flat overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={selected.name} size="md" />
                    <div>
                      <p className="font-black text-main">{selected.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{selected.role} · {selected.company}</p>
                      {selected.bio && <p className="mt-2 text-xs leading-5 text-muted max-w-xs">{selected.bio}</p>}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-xl border border-app px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-muted">Reply</p>
                    <p className="text-2xl font-black text-main">{selected.response_probability}%</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selected.is_connected && <span className="badge badge-green">Connected</span>}
                  {selected.is_alumni && <span className="badge badge-amber">Alumni · {selected.shared_college}</span>}
                  {selected.is_coworker && <span className="badge badge-purple">Coworker · {selected.shared_company}</span>}
                </div>

                {(Array.isArray(selected.skills) && selected.skills.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selected.skills.map((skill) => (
                      <span key={skill} className="badge badge-blue">{skill}</span>
                    ))}
                  </div>
                )}
              </div>

              {(selected.linkedin_url || selected.github_url || selected.email) && (
                <div className="flex gap-2 border-t border-app px-5 py-3">
                  {selected.linkedin_url && (
                    <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-xs">LinkedIn</a>
                  )}
                  {selected.github_url && (
                    <a href={selected.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-xs">GitHub</a>
                  )}
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="btn-secondary px-3 py-1.5 text-xs">Email</a>
                  )}
                </div>
              )}
            </div>

            {/* Message draft */}
            <div className="surface-flat overflow-hidden">
              <div className="flex items-center justify-between border-b border-app px-5 py-3">
                <div>
                  <p className="text-sm font-black text-main">Referral message</p>
                  <p className="text-[10px] text-muted mt-0.5">To {selected.name} · {selected.company}</p>
                </div>
                <button
                  onClick={copyMessage}
                  disabled={!message || detailLoading}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>

              {detailLoading ? (
                <div className="space-y-2.5 p-5">
                  <SkeletonLine w="3/4" />
                  <SkeletonLine w="full" />
                  <SkeletonLine w="5/6" />
                  <SkeletonLine w="full" />
                  <SkeletonLine w="2/3" />
                  <div className="pt-1" />
                  <SkeletonLine w="full" />
                  <SkeletonLine w="4/5" />
                </div>
              ) : (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none border-0 bg-transparent px-5 py-4 text-sm leading-7 text-main outline-none"
                  rows={12}
                  placeholder="Message will appear here…"
                />
              )}

              <div className="border-t border-app px-5 py-4">
                <button
                  onClick={requestReferral}
                  disabled={!message || detailLoading || !!requestResult}
                  className="btn-primary px-5 py-2.5 text-sm font-black"
                >
                  {requestResult ? "Request sent ✓" : "Send referral request"}
                </button>
                {requestResult && (
                  <p className="mt-2 text-xs font-bold text-[var(--accent)]">
                    Request sent to {requestResult.employee?.name || selected.name}.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : !matches.length && job ? (
          <div className="surface-flat empty-state">
            <div className="text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 font-black text-main">No employees found</p>
              <p className="mt-1 max-w-xs text-sm text-muted">No employees found at this company in the database.</p>
            </div>
          </div>
        ) : !job ? (
          <div className="surface-flat empty-state">
            <div className="text-center">
              <p className="text-4xl">✉️</p>
              <p className="mt-3 font-black text-main">Ready when you are</p>
              <p className="mt-1 max-w-xs text-sm text-muted">Paste a job description to see matching referrers.</p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Student;
