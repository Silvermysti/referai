import { useRef, useState } from "react";
import AutocompleteInput from "../components/AutocompleteInput";
import ExtractionPreview from "../components/ExtractionPreview";
import TagInput from "../components/TagInput";
import { BRANCHES, COLLEGES, COMPANIES, DEGREES, INTERESTS, ROLES, SKILLS } from "../data/suggestions";
import { updateProfile, uploadResume } from "../services/api";

const GRAD_YEARS = Array.from({ length: 51 }, (_, i) => new Date().getFullYear() + 5 - i);

const EMPTY_EDU = { college: "", degree: "", branch: "", graduation_year: "" };
const EMPTY_EXP = { company: "", role: "", duration: "", description: "" };

const eduKey = (e) =>
  `${(e.college || "").toLowerCase().trim()}|${(e.degree || "").toLowerCase().trim()}`;

const expKey = (e) =>
  `${(e.company || "").toLowerCase().trim()}|${(e.role || "").toLowerCase().trim()}`;

const mergeEducation = (existing, incoming) => {
  const keys = new Set(existing.map(eduKey));
  return [...existing, ...incoming.filter((e) => !keys.has(eduKey(e)))];
};

const mergeExperience = (existing, incoming) => {
  const keys = new Set(existing.map(expKey));
  return [...existing, ...incoming.filter((e) => !keys.has(expKey(e)))];
};

const Profile = ({ user, onUserUpdate }) => {
  const [skills, setSkills] = useState(user?.skills || []);
  const [interests, setInterests] = useState(user?.interests || []);
  const [targetCompanies, setTargetCompanies] = useState(user?.target_companies || []);
  const [currentRole, setCurrentRole] = useState(user?.current_role || "");
  const [targetRole, setTargetRole] = useState(user?.target_role || "");
  const [education, setEducation] = useState(user?.education || []);
  const [experience, setExperience] = useState(user?.experience || []);

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
    const confirmedSkills = confirmed.skills || [];
    const confirmedInterests = confirmed.interests || [];
    const confirmedEducation = confirmed.education || [];
    const confirmedExperience = confirmed.experience || [];

    // Merge confirmed data into local state — capture merged values as variables
    // so the API call below uses the same values (avoids stale-state race).
    const newSkills = [...new Set([...skills, ...confirmedSkills].map((s) => s.toLowerCase()))].map(
      (s) => confirmedSkills.find((cs) => cs.toLowerCase() === s) || skills.find((es) => es.toLowerCase() === s) || s
    );
    const newInterests = [...new Set([...interests, ...confirmedInterests])];
    const newCurrentRole = confirmed.current_role || currentRole;
    const mergedEdu = mergeEducation(education, confirmedEducation);
    const mergedExp = mergeExperience(experience, confirmedExperience);

    setSkills(newSkills);
    setInterests(newInterests);
    if (confirmed.current_role && !currentRole) setCurrentRole(newCurrentRole);
    setEducation(mergedEdu);
    setExperience(mergedExp);

    // Save to backend
    setSaving(true);
    setError("");
    try {
      const result = await updateProfile({
        userId: user.id,
        skills: newSkills,
        education: mergedEdu,
        experience: mergedExp,
        interests: newInterests,
        targetCompanies,
        currentRole: newCurrentRole,
        targetRole,
        summary: confirmed.summary || "",
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
        education,
        experience,
        interests,
        targetCompanies,
        currentRole,
        targetRole,
        summary: user?.summary || "",
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
          suggestions={SKILLS}
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
          suggestions={INTERESTS}
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
          suggestions={COMPANIES}
        />
      </section>

      {/* Role */}
      <section className="surface-flat mb-6 p-6">
        <p className="mb-4 text-sm font-black uppercase tracking-wide text-muted">Role info</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-main">Current role</span>
            <AutocompleteInput
              value={currentRole}
              onChange={setCurrentRole}
              suggestions={ROLES}
              placeholder="e.g. SWE Intern at Flipkart"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-main">Target role</span>
            <AutocompleteInput
              value={targetRole}
              onChange={setTargetRole}
              suggestions={ROLES}
              placeholder="e.g. Backend Engineer"
            />
          </label>
        </div>
      </section>

      {/* Education */}
      <section className="surface-flat mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-black uppercase tracking-wide text-muted">Education</p>
          <button
            type="button"
            onClick={() => setEducation((prev) => [...prev, { ...EMPTY_EDU }])}
            className="text-xs font-bold text-accent hover:underline"
          >
            + Add
          </button>
        </div>
        {education.length === 0 && (
          <p className="text-sm text-muted">No education added yet. Upload a resume or click + Add.</p>
        )}
        {education.map((edu, i) => (
          <div key={i} className="mb-3 rounded-lg border border-app p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">College / University</span>
                <AutocompleteInput
                  value={edu.college || ""}
                  onChange={(v) => setEducation((prev) => prev.map((r, j) => j === i ? { ...r, college: v } : r))}
                  suggestions={COLLEGES}
                  placeholder="e.g. IIT Delhi"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Degree</span>
                <AutocompleteInput
                  value={edu.degree || ""}
                  onChange={(v) => setEducation((prev) => prev.map((r, j) => j === i ? { ...r, degree: v } : r))}
                  suggestions={DEGREES}
                  placeholder="e.g. B.Tech"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Branch / Major</span>
                <AutocompleteInput
                  value={edu.branch || ""}
                  onChange={(v) => setEducation((prev) => prev.map((r, j) => j === i ? { ...r, branch: v } : r))}
                  suggestions={BRANCHES}
                  placeholder="e.g. Computer Science"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Graduation year</span>
                <select
                  className="field"
                  value={edu.graduation_year || ""}
                  onChange={(e) => setEducation((prev) => prev.map((r, j) => j === i ? { ...r, graduation_year: e.target.value ? parseInt(e.target.value) : "" } : r))}
                >
                  <option value="">Select year</option>
                  {GRAD_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={() => setEducation((prev) => prev.filter((_, j) => j !== i))}
              className="mt-3 text-xs font-bold text-rose-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* Experience */}
      <section className="surface-flat mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-black uppercase tracking-wide text-muted">Experience</p>
          <button
            type="button"
            onClick={() => setExperience((prev) => [...prev, { ...EMPTY_EXP }])}
            className="text-xs font-bold text-accent hover:underline"
          >
            + Add
          </button>
        </div>
        {experience.length === 0 && (
          <p className="text-sm text-muted">No experience added yet. Upload a resume or click + Add.</p>
        )}
        {experience.map((exp, i) => (
          <div key={i} className="mb-3 rounded-lg border border-app p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Company</span>
                <AutocompleteInput
                  value={exp.company || ""}
                  onChange={(v) => setExperience((prev) => prev.map((r, j) => j === i ? { ...r, company: v } : r))}
                  suggestions={COMPANIES}
                  placeholder="e.g. Google"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Role</span>
                <AutocompleteInput
                  value={exp.role || ""}
                  onChange={(v) => setExperience((prev) => prev.map((r, j) => j === i ? { ...r, role: v } : r))}
                  suggestions={ROLES}
                  placeholder="e.g. Software Engineer"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Duration</span>
                <input
                  className="field"
                  value={exp.duration || ""}
                  onChange={(e) => setExperience((prev) => prev.map((r, j) => j === i ? { ...r, duration: e.target.value } : r))}
                  placeholder="e.g. Jun 2023 – Aug 2023"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-bold text-muted">Description</span>
                <textarea
                  className="field resize-none"
                  rows={2}
                  value={exp.description || ""}
                  onChange={(e) => setExperience((prev) => prev.map((r, j) => j === i ? { ...r, description: e.target.value } : r))}
                  placeholder="Brief description of your work"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => setExperience((prev) => prev.filter((_, j) => j !== i))}
              className="mt-3 text-xs font-bold text-rose-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
      {saveSuccess && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Profile updated.</p>}

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 text-sm disabled:opacity-50">
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
};

export default Profile;
