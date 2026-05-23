import { useEffect, useState } from "react";
import { getReferralRequests, submitReferralDecision } from "../services/api";

const decisions = [
  { id: "strong_vouch", label: "Strong vouch", description: "Ready for referral now" },
  { id: "moderate_vouch", label: "Moderate vouch", description: "Refer with context" },
  { id: "not_ready", label: "Not ready", description: "Needs more proof" },
];

const Employee = () => {
  const [requests, setRequests] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState("");
  const [decision, setDecision] = useState("strong_vouch");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeRequest = requests.find((item) => item.id === activeRequestId) || requests[0];

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getReferralRequests();
      setRequests(data.requests);
      setActiveRequestId((current) => current || data.requests[0]?.id || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submitDecision = async () => {
    if (!activeRequest) return;
    setSaving(true);
    setError("");
    try {
      const data = await submitReferralDecision({ requestId: activeRequest.id, decision, notes });
      setRequests((current) => current.map((item) => (item.id === data.request.id ? data.request : item)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-main md:text-5xl">Review referral requests.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">Evaluate candidates with fit scores, work samples, and context before you vouch.</p>
        </div>
        <button onClick={loadRequests} className="btn-secondary px-4 py-3 text-sm">
          Refresh
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}

      {loading ? (
        <div className="surface-flat p-8 text-muted">Loading requests...</div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {requests.length ? requests.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveRequestId(item.id)}
                className={`surface-flat w-full p-5 text-left transition hover:shadow-md ${activeRequest?.id === item.id ? "ring-2 ring-[var(--primary)]" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-muted">{item.job.company}</p>
                    <h3 className="mt-1 text-lg font-black text-main">{item.candidate.full_name}</h3>
                    <p className="mt-1 text-sm text-muted">{item.job.role}</p>
                  </div>
                  <span className="badge badge-amber">{item.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg soft p-3">
                    <p className="text-xs text-muted">Match</p>
                    <p className="font-black text-main">{item.match.match_score}</p>
                  </div>
                  <div className="rounded-lg soft p-3">
                    <p className="text-xs text-muted">Reward</p>
                    <p className="font-black text-main">${item.reward}</p>
                  </div>
                  <div className="rounded-lg soft p-3">
                    <p className="text-xs text-muted">Reply</p>
                    <p className="font-black text-main">{item.employee.response_probability}%</p>
                  </div>
                </div>
              </button>
            )) : (
              <div className="surface-flat p-6 text-sm leading-6 text-muted">
                No active referral requests yet. New candidate requests will appear here automatically.
              </div>
            )}
          </div>

          {activeRequest && (
            <div className="space-y-6">
              <div className="surface-flat p-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-muted">AI review assistant</p>
                    <h3 className="mt-1 text-xl font-black text-main">
                      {activeRequest.ai_review?.readiness_score}% referral readiness
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                      {activeRequest.ai_review?.llm_summary}
                    </p>
                  </div>
                  <span className={`badge ${activeRequest.ai_review?.llm?.active ? "badge-green" : "badge-amber"}`}>
                    {activeRequest.ai_review?.llm?.active
                      ? `${activeRequest.ai_review.llm.provider} · ${activeRequest.ai_review.llm.model}`
                      : "Free LLM offline"}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {activeRequest.ai_review?.recommended_path?.map((item) => (
                    <div key={item} className="rounded-lg soft p-3 text-sm font-bold leading-6 text-main">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-flat p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-muted">Candidate</p>
                    <h3 className="mt-1 text-2xl font-black text-main">{activeRequest.candidate.full_name}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {activeRequest.candidate.school} · {activeRequest.candidate.current_role}
                    </p>
                  </div>
                  <div className="rounded-lg border border-app bg-[rgb(6_167_125_/_0.12)] px-4 py-3">
                    <p className="text-xs font-bold text-[var(--accent)]">Payout</p>
                    <p className="text-2xl font-black text-[var(--accent)]">${activeRequest.reward}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {activeRequest.match.explainability.map((reason) => (
                    <div key={reason} className="rounded-lg soft p-3 text-sm font-bold text-main">
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-flat p-5">
                <p className="text-sm font-black uppercase tracking-wide text-muted">Evidence</p>
                <div className="mt-4 space-y-3">
                  {activeRequest.candidate.skills_matrix.map((skill) => (
                    <div key={skill.name} className="rounded-lg border border-app p-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-bold text-main">{skill.name}</p>
                        <span className={`badge ${skill.status === "VERIFIED" ? "badge-green" : "badge-amber"}`}>
                          {skill.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">{skill.proof_of_work}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-flat p-5">
                <p className="text-sm font-black uppercase tracking-wide text-muted">Decision</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {decisions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setDecision(item.id)}
                      className={`rounded-lg border p-4 text-left ${decision === item.id ? "border-[var(--primary)] bg-[rgb(33_85_217_/_0.12)]" : "border-app bg-[var(--surface)] hover:bg-[var(--surface-soft)]"}`}
                    >
                      <span className="block text-sm font-black text-main">{item.label}</span>
                      <span className="mt-1 block text-xs text-muted">{item.description}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="field mt-4 h-24"
                  placeholder="Add reasoning for the recruiter."
                />
                <button onClick={submitDecision} disabled={saving} className="btn-primary mt-4 px-5 py-3 text-sm">
                  {saving ? "Saving" : "Submit decision"}
                </button>
              </div>
            </div>
          )}
          {!activeRequest && (
            <div className="surface-flat empty-state xl:col-span-2">
              <div>
                <p className="text-lg font-black text-main">No requests yet</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                  Referral requests will appear here after an employee sends one to you.
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Employee;
