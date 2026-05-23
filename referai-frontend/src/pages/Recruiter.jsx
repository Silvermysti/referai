import { useMemo, useState } from "react";
import { markRecruiterReferral, sourceRecruiterProfiles } from "../services/api";

const Recruiter = () => {
  const [jobUrl, setJobUrl] = useState("");
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [referringId, setReferringId] = useState("");
  const [error, setError] = useState("");

  const selected = useMemo(
    () => matches.find((match) => match.id === selectedId) || matches[0],
    [matches, selectedId],
  );

  const searchProfiles = async () => {
    if (!jobUrl.trim()) {
      setError("Paste a job link or role before sourcing profiles.");
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const data = await sourceRecruiterProfiles({ jobUrl });
      setJob(data.job);
      setMatches(data.matches || []);
      setSelectedId(data.matches?.[0]?.id || "");
      setNotice(data.notice || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markReferred = async (profile) => {
    if (!job || !profile) return;
    setReferringId(profile.id);
    setError("");
    try {
      await markRecruiterReferral({ job, profile });
      setMatches((current) =>
        current.map((item) => (item.id === profile.id ? { ...item, status: "Shortlisted" } : item)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setReferringId("");
    }
  };

  const openProfile = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.75fr)]">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-main md:text-5xl">Recruiter sourcing.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Paste a job link or role. ReferAI finds public candidate profiles with similar skills, location, and career stage, then ranks the best matches.
          </p>
        </div>

        <div className="surface-flat p-5">
          <label className="text-sm font-black text-main" htmlFor="recruiter-job-url">
            Job link or role
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="recruiter-job-url"
              value={jobUrl}
              onChange={(event) => setJobUrl(event.target.value)}
              className="field"
              placeholder="LinkedIn job URL or Data Analyst at Netflix"
            />
            <button onClick={searchProfiles} disabled={loading} className="btn-primary min-h-11 px-5 text-sm">
              {loading ? "Sourcing" : "Find matches"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>}
        </div>
      </div>

      {job && (
        <section className="surface-flat mb-6 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-muted">Open role</p>
              <h3 className="mt-1 text-2xl font-black text-main">
                {job.role} at {job.company}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{job.description}</p>
              {notice && <p className="mt-3 text-xs font-bold text-muted">{notice}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {job.skills?.map((skill) => (
                <span key={skill} className="badge badge-blue">{skill}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {matches.length > 0 ? (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {matches.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedId(profile.id)}
                className={`surface-flat w-full p-5 text-left transition hover:-translate-y-0.5 ${
                  selected?.id === profile.id ? "ring-2 ring-[var(--primary)]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <img
                      src={profile.profile_image_url}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-wide text-muted">Rank #{profile.rank}</p>
                      <h3 className="mt-1 truncate text-lg font-black text-main">{profile.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted">{profile.headline}</p>
                      <p className="mt-1 text-xs font-bold text-muted">
                        @{profile.linkedin_handle} · {profile.location}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[rgb(33_85_217_/_0.12)] px-3 py-2 text-center">
                    <p className="text-xs font-bold text-[var(--primary)]">Match</p>
                    <p className="text-2xl font-black text-[var(--primary-strong)]">{profile.match_score}%</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={profile.status === "Shortlisted" ? "badge badge-green" : "badge badge-amber"}>
                    {profile.status}
                  </span>
                  {profile.match_reasons?.slice(0, 2).map((reason) => (
                    <span key={reason} className="badge badge-blue">{reason}</span>
                  ))}
                  {profile.skills?.slice(0, 3).map((skill) => (
                    <span key={skill} className="badge badge-green">{skill}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-6">
              <div className="surface-flat p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="flex gap-4">
                    <img
                      src={selected.profile_image_url}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-black uppercase tracking-wide text-muted">Best match details</p>
                      <h3 className="mt-1 text-2xl font-black text-main">{selected.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted">{selected.headline}</p>
                      <p className="mt-1 text-xs font-bold text-muted">
                        @{selected.linkedin_handle} · {selected.location}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-muted">{selected.summary}</p>
                      <p className="mt-2 text-xs font-bold text-muted">{selected.source}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-app px-4 py-3 text-center">
                    <p className="text-xs font-bold text-muted">Match</p>
                    <p className="text-3xl font-black text-main">{selected.match_score}%</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.skills?.map((skill) => (
                    <span key={skill} className="badge badge-green">{skill}</span>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {selected.match_reasons?.map((reason) => (
                    <div key={reason} className="rounded-lg soft p-3 text-sm font-bold leading-6 text-main">
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-flat p-5">
                <p className="text-sm font-black uppercase tracking-wide text-muted">Fit rationale</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                  {selected.fit_reason || selected.llm_reason}
                </p>
              </div>

              <div className="surface-flat p-5">
                <p className="text-sm font-black uppercase tracking-wide text-muted">Pipeline status</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button onClick={() => openProfile(selected.linkedin_url)} className="btn-secondary px-4 py-3 text-sm">
                    Open profile
                  </button>
                  <button
                    onClick={() => markReferred(selected)}
                    disabled={selected.status === "Shortlisted" || referringId === selected.id}
                    className="btn-primary px-4 py-3 text-sm"
                  >
                    {selected.status === "Shortlisted" ? "Shortlisted" : referringId === selected.id ? "Saving" : "Add to shortlist"}
                  </button>
                </div>
                <p className="mt-3 text-sm font-bold text-muted">
                  Current status: <span className="text-main">{selected.status}</span>
                </p>
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="surface-flat empty-state">
          <div>
            <p className="text-lg font-black text-main">{job ? "No public candidate profiles found" : "No recruiter search yet"}</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              {job
                ? "Try a richer job link or include the role, skills, and location so ReferAI can find actual public LinkedIn profile results."
                : "Add a job link to source and rate the top public profiles for that role."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruiter;
