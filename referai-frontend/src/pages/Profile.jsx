import { useRef, useState } from "react";
import ExtractionPreview from "../components/ExtractionPreview";
import TagInput from "../components/TagInput";
import { updateProfile, uploadResume } from "../services/api";

const Profile = ({ user, onUserUpdate }) => {
  const [skills, setSkills] = useState(user?.skills || []);
  const [interests, setInterests] = useState(user?.interests || []);
  const [targetCompanies, setTargetCompanies] = useState(user?.target_companies || []);
  const [currentRole, setCurrentRole] = useState(user?.current_role || "");
  const [targetRole, setTargetRole] = useState(user?.target_role || "");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [extraction, setExtraction] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const result = await uploadResume(file);
      setExtraction(result);  // result has { extracted, provider, preview_text }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirmExtraction = async (confirmed) => {
    setExtraction(null);
    // Merge confirmed data into local state immediately for visual feedback
    const newSkills = [...new Set([...skills, ...confirmed.skills].map((s) => s.toLowerCase()))].map(
      (s) => confirmed.skills.find((cs) => cs.toLowerCase() === s) || skills.find((es) => es.toLowerCase() === s) || s
    );
    setSkills(newSkills);
    setInterests((prev) => [...new Set([...prev, ...confirmed.interests])]);
    if (confirmed.current_role && !currentRole) setCurrentRole(confirmed.current_role);

    // Save to backend
    setSaving(true);
    setError("");
    try {
      const result = await updateProfile({
        userId: user.id,
        skills: newSkills,
        education: confirmed.education,
        experience: confirmed.experience,
        interests: [...new Set([...interests, ...confirmed.interests])],
        targetCompanies,
        currentRole: confirmed.current_role || currentRole,
        targetRole,
        summary: confirmed.summary,
      });
      onUserUpdate(result.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);
    try {
      const result = await updateProfile({
        userId: user.id,
        skills,
        education: user.education || [],
        experience: user.experience || [],
        interests,
        targetCompanies,
        currentRole,
        targetRole,
      });
      onUserUpdate(result.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      {extraction && (
        <ExtractionPreview
          extracted={extraction.extracted}
          provider={extraction.provider}
          onConfirm={handleConfirmExtraction}
          onCancel={() => setExtraction(null)}
        />
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-main">Profile</h2>
        <p className="mt-2 text-base text-muted">
          Your skills, interests, and target companies improve referral matching. Upload your resume to fill these in automatically.
        </p>
      </div>

      {/* Resume upload */}
      <section className="surface-flat mb-6 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-muted">Resume</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Upload a PDF or DOCX. Skills, education, experience, and interests are extracted automatically and added to your profile — they won't overwrite anything you've already added.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-primary px-5 py-3 text-sm disabled:opacity-50"
          >
            {uploading ? "Reading resume…" : "Upload resume"}
          </button>
          <span className="text-xs text-muted">PDF or DOCX · max 10 MB</span>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
        {uploadError && <p className="mt-3 text-sm font-bold text-rose-600">{uploadError}</p>}
      </section>

      {/* Skills */}
      <section className="surface-flat mb-6 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-muted">Skills</p>
        <p className="mt-1 mb-4 text-sm text-muted">Technical skills, tools, and frameworks.</p>
        <TagInput
          tags={skills}
          onChange={setSkills}
          placeholder="e.g. Python, React, PostgreSQL"
        />
      </section>

      {/* Interests */}
      <section className="surface-flat mb-6 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-muted">Interests</p>
        <p className="mt-1 mb-4 text-sm text-muted">Domains and areas you want to work in — used to improve your match score.</p>
        <TagInput
          tags={interests}
          onChange={setInterests}
          placeholder="e.g. machine learning, fintech, open source"
        />
      </section>

      {/* Target companies */}
      <section className="surface-flat mb-6 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-muted">Target companies</p>
        <p className="mt-1 mb-4 text-sm text-muted">Companies you're actively interested in. Employees at these companies get a score boost.</p>
        <TagInput
          tags={targetCompanies}
          onChange={setTargetCompanies}
          placeholder="e.g. Google, Stripe, Flipkart"
        />
      </section>

      {/* Role */}
      <section className="surface-flat mb-6 p-6">
        <p className="mb-4 text-sm font-black uppercase tracking-wide text-muted">Role info</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-main">Current role</span>
            <input
              className="field"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. SWE Intern at Flipkart"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-main">Target role</span>
            <input
              className="field"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Backend Engineer"
            />
          </label>
        </div>
      </section>

      {/* Education & Experience — read-only view, edit via resume upload */}
      {(user?.education?.length > 0 || user?.experience?.length > 0) && (
        <section className="surface-flat mb-6 p-6">
          <p className="mb-4 text-sm font-black uppercase tracking-wide text-muted">Education & Experience</p>
          <p className="mb-4 text-xs text-muted">Added from resume uploads. Upload a new resume to add more.</p>
          {user.education?.map((edu, i) => (
            <div key={i} className="mb-2 rounded-lg border border-app p-3">
              <p className="text-sm font-black text-main">{edu.college}</p>
              <p className="text-xs text-muted">{[edu.degree, edu.branch, edu.graduation_year].filter(Boolean).join(" · ")}</p>
            </div>
          ))}
          {user.experience?.map((exp, i) => (
            <div key={i} className="mb-2 rounded-lg border border-app p-3">
              <p className="text-sm font-black text-main">{exp.role} at {exp.company}</p>
              <p className="text-xs text-muted">{[exp.duration, exp.description].filter(Boolean).join(" · ").slice(0, 120)}</p>
            </div>
          ))}
        </section>
      )}

      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
      {saveSuccess && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Profile updated.</p>}

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 text-sm disabled:opacity-50">
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
};

export default Profile;
