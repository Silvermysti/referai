import { useMemo, useState } from "react";
import {
  createReferralRequest,
  generateMessage,
  getCareerCompanion,
  getMatches,
  parseJob,
  submitProof,
} from "../services/api";

const Student = ({ user }) => {
  const [jobUrl, setJobUrl] = useState("");
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [copilot, setCopilot] = useState(null);
  const [proofSolution, setProofSolution] = useState("");
  const [proofResult, setProofResult] = useState(null);
  const [requestResult, setRequestResult] = useState(null);
  const [jobConfidence, setJobConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeChallenge = useMemo(() => {
    const candidate = selected || matches[0];
    return candidate?.skills_matrix?.find((skill) => skill.status === "MISSING");
  }, [matches, selected]);

  const analyzeOpportunity = async () => {
    if (!jobUrl.trim()) {
      setError("Enter a job link to search.");
      return;
    }

    setLoading(true);
    setError("");
    setRequestResult(null);
    setProofResult(null);

    try {
      const parsed = await parseJob(jobUrl);
      const ranked = await getMatches({ jobId: parsed.job.id, job: parsed.job, deiMode: true });
      setJob(parsed.job);
      setJobConfidence(parsed.confidence);
      setMatches(ranked.matches || []);
      setContacts(ranked.contacts || []);
      setProfiles(ranked.profiles || []);
      setSelectedProfile(ranked.profiles?.[0] || null);
      setNotice(ranked.notice || "");
      setSelected(ranked.matches?.[0] || null);
      if (ranked.matches?.length) {
        const aiPlan = await getCareerCompanion({
          candidateId: ranked.matches[0].id,
          jobId: parsed.job.id,
          job: parsed.job,
          profile: user,
        });
        setCopilot(aiPlan.copilot);
        const intro = await generateMessage({
          candidateId: ranked.matches[0].id,
          employeeId: ranked.matches[0].recommended_referrer.id,
          jobId: parsed.job.id,
          job: parsed.job,
        });
        setMessage(intro.message);
      } else {
        setCopilot(null);
        setMessage(buildLiveJobMessage(parsed.job, user));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectCandidate = async (candidate) => {
    setSelected(candidate);
    setProofResult(null);
    setRequestResult(null);
    const aiPlan = await getCareerCompanion({
      candidateId: candidate.id,
      jobId: job.id,
      job,
      profile: user,
    });
    setCopilot(aiPlan.copilot);
    const intro = await generateMessage({
      candidateId: candidate.id,
      employeeId: candidate.recommended_referrer.id,
      jobId: job.id,
      job,
    });
    setMessage(intro.message);
  };

  const handleProofSubmit = async () => {
    if (!selected || !proofSolution.trim()) return;
    setProofResult(await submitProof({ candidateId: selected.id, solution: proofSolution }));
  };

  const requestReferral = async () => {
    if (!selected || !job) return;
    const response = await createReferralRequest({
      candidateId: selected.id,
      employeeId: selected.recommended_referrer.id,
      jobId: job.id,
      job,
      message,
    });
    setRequestResult(response.request);
  };

  const buildLiveJobMessage = (liveJob, account) =>
    `Hi,\n\nI am interested in the ${liveJob.role} role at ${liveJob.company}. I found the opening from ${liveJob.source_url || "the job posting"}.\n\nMy relevant background includes work aligned with ${liveJob.skills.join(", ")}. Could you please point me to the right recruiter, hiring manager, or referral process for this role?\n\nThanks,\n${account?.name || "Candidate"}`;

  const openContactRoute = (route) => {
    window.open(route.url, "_blank", "noopener,noreferrer");
  };

  const openProfileLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <section className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.75fr)]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-main md:text-5xl">Find the right referrer.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">Paste a role link to rank referrers, LinkedIn paths, and contact options.</p>
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
          {notice && (
            <div className="surface-flat border-amber-200 bg-amber-50 p-5 text-sm font-bold leading-6 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              {notice}
            </div>
          )}

          {profiles.length > 0 && (
            <div className="surface-flat p-5">
              <p className="text-sm font-black uppercase tracking-wide text-muted">Ranked referral paths</p>
              <div className="mt-4 grid gap-3">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className={`rounded-lg border p-4 text-left transition hover:border-[var(--primary)] ${
                      selectedProfile?.id === profile.id ? "border-[var(--primary)] bg-[rgb(33_85_217_/_0.08)]" : "border-app"
                    }`}
                  >
                    <div className="flex gap-4">
                      {profile.profile_image_url ? (
                        <img src={profile.profile_image_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-black text-main">
                          {profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-main">#{profile.rank} {profile.name}</p>
                          <span className="badge badge-blue">{profile.match_score}% fit</span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted">{profile.headline}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {profile.match_reasons?.slice(0, 3).map((reason) => (
                            <span key={reason} className="badge badge-green">{reason}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedProfile && (
            <div className="surface-flat p-5">
              <p className="text-sm font-black uppercase tracking-wide text-muted">Selected referrer profile</p>
              <div className="mt-4 flex gap-4">
                {selectedProfile.profile_image_url ? (
                  <img src={selectedProfile.profile_image_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-lg font-black text-main">
                    {selectedProfile.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-main">{selectedProfile.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{selectedProfile.headline}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{selectedProfile.summary}</p>
                  <p className="mt-2 text-xs font-bold text-muted">{selectedProfile.source}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => openProfileLink(selectedProfile.linkedin_url)} className="btn-primary px-4 py-2 text-sm">
                  Open LinkedIn
                </button>
                {selectedProfile.email && (
                  <button onClick={() => openProfileLink(`mailto:${selectedProfile.email}`)} className="btn-secondary px-4 py-2 text-sm">
                    Email
                  </button>
                )}
                {selectedProfile.phone && (
                  <button onClick={() => openProfileLink(`tel:${selectedProfile.phone}`)} className="btn-secondary px-4 py-2 text-sm">
                    Phone
                  </button>
                )}
              </div>
            </div>
          )}

          {contacts.length > 0 && profiles.length === 0 && (
            <div className="surface-flat p-5">
              <p className="text-sm font-black uppercase tracking-wide text-muted">Ranked referral paths</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                No public employee profile cards could be fetched for this company from publicly accessible pages. Use the LinkedIn recruiter and employee searches below to choose real profiles directly.
              </p>
            </div>
          )}

          {contacts.length > 0 && (
            <div className="surface-flat p-5">
              <p className="text-sm font-black uppercase tracking-wide text-muted">Search and apply fallback</p>
              <div className="mt-4 grid gap-3">
                {contacts.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => openContactRoute(route)}
                    className="rounded-lg border border-app p-4 text-left transition hover:border-[var(--primary)]"
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-black text-main">{route.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted">{route.subtitle}</p>
                      </div>
                      <span className={`badge ${route.verified ? "badge-green" : "badge-blue"}`}>{route.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                LinkedIn still requires you to choose the person and send the message inside LinkedIn.
              </p>
            </div>
          )}

          {contacts.length > 0 && (
            <div className="surface-flat p-5">
              <p className="text-sm font-black uppercase tracking-wide text-muted">Message draft</p>
              <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                {message}
              </pre>
            </div>
          )}

          {matches.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => selectCandidate(candidate)}
              className={`surface-flat w-full p-5 text-left transition hover:-translate-y-0.5 ${
                selected?.id === candidate.id ? "ring-2 ring-[var(--primary)]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-muted">{candidate.anonymous_id}</p>
                  <h3 className="mt-1 text-lg font-black text-main">{candidate.full_name}</h3>
                  <p className="mt-1 text-sm text-muted">{candidate.current_role}</p>
                </div>
                <div className="rounded-lg bg-[rgb(33_85_217_/_0.12)] px-3 py-2 text-center">
                  <p className="text-xs font-bold text-[var(--primary)]">Match</p>
                  <p className="text-2xl font-black text-[var(--primary-strong)]">{candidate.match_score}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {candidate.skills_matrix.map((skill) => (
                  <span key={skill.name} className={`badge ${skill.status === "VERIFIED" ? "badge-green" : "badge-amber"}`}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="space-y-6">
            {copilot && (
              <div className="surface-flat p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-muted">AI career companion</p>
                    <h3 className="mt-1 text-xl font-black text-main">{copilot.readiness_score}% launch readiness</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Multi-agent plan for skill building, opportunity access, work simulation, and inclusive proof-led matching.
                    </p>
                  </div>
                  <span className="badge badge-green">AI/ML active</span>
                </div>

                <div className="mt-4 rounded-lg border border-app p-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <p className="text-sm font-black text-main">Free LLM model</p>
                    <span className={`badge ${copilot.llm?.active ? "badge-green" : "badge-amber"}`}>
                      {copilot.llm?.active ? `${copilot.llm.provider} · ${copilot.llm.model}` : "Offline fallback"}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{copilot.llm_summary}</p>
                </div>

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

                <div className="mt-4 rounded-lg soft p-4">
                  <p className="text-sm font-black text-main">{copilot.simulation.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{copilot.simulation.brief}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {copilot.simulation.deliverables.map((item) => (
                      <span key={item} className="badge badge-amber">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="surface-flat p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-muted">Recommended referrer</p>
                  <h3 className="mt-1 text-xl font-black text-main">{selected.recommended_referrer.alumnus_name}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {selected.recommended_referrer.alumnus_role} at {selected.recommended_referrer.alumnus_company}
                  </p>
                </div>
                <div className="rounded-lg border border-app px-3 py-2 text-center">
                  <p className="text-xs font-bold text-muted">Reply</p>
                  <p className="text-2xl font-black text-main">{selected.recommended_referrer.response_probability}%</p>
                </div>
              </div>
              <p className="mt-4 rounded-lg soft p-4 text-sm leading-6 text-muted">
                {selected.recommended_referrer.shared_affinity_context}
              </p>
              {!selected.recommended_referrer.is_verified_for_company && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
                  No direct employee at {job.company} is verified in this demo network, so this is an intro path, not a confirmed referral route.
                </p>
              )}
            </div>

            <div className="surface-flat p-5">
              <p className="text-sm font-black uppercase tracking-wide text-muted">Skill check</p>
              <h3 className="mt-1 text-xl font-black text-main">{activeChallenge?.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{activeChallenge?.proof_of_work}</p>
              <textarea
                value={proofSolution}
                onChange={(event) => setProofSolution(event.target.value)}
                className="field mt-4 h-28"
                placeholder="Write your approach"
              />
              <button onClick={handleProofSubmit} disabled={!proofSolution.trim()} className="btn-primary mt-3 px-5 py-3 text-sm">
                Submit
              </button>
              {proofResult && (
                <div className="mt-4 rounded-lg border border-app bg-[rgb(6_167_125_/_0.12)] p-4">
                  <p className="text-sm font-black text-[var(--accent)]">
                    {proofResult.status === "verified" ? "Verified" : "Needs review"} · {proofResult.proof_score}
                  </p>
                  <p className="mt-1 text-sm text-muted">{proofResult.feedback}</p>
                </div>
              )}
            </div>

            <div className="surface-flat p-5">
              <p className="text-sm font-black uppercase tracking-wide text-muted">Referral message</p>
              <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                {message}
              </pre>
              <button onClick={requestReferral} disabled={!proofResult} className="btn-primary mt-4 px-5 py-3 text-sm">
                {selected.recommended_referrer.is_verified_for_company ? "Request referral" : "Ask for intro"}
              </button>
              {requestResult && (
                <p className="mt-3 rounded-lg soft p-3 text-sm font-black text-main">
                  Sent to {requestResult.employee.alumnus_name}. Reward ${requestResult.reward}.
                </p>
              )}
            </div>
          </div>
        ) : !contacts.length ? (
          <div className="surface-flat empty-state">
            <div>
              <p className="text-lg font-black text-main">No search yet</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                Add a job link to see matching referrers, skill checks, and referral options.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Student;
