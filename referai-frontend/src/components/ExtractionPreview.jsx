import { useState } from "react";

const ExtractionPreview = ({ extracted, deepseekUsed, onConfirm, onCancel }) => {
  const [skills, setSkills] = useState(extracted.skills || []);
  const [education, setEducation] = useState(extracted.education || []);
  const [experience, setExperience] = useState(extracted.experience || []);
  const [interests, setInterests] = useState(extracted.interests || []);

  const toggleSkill = (skill) =>
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);

  const toggleInterest = (interest) =>
    setInterests((prev) => prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]);

  const removeEdu = (i) => setEducation((prev) => prev.filter((_, idx) => idx !== i));
  const removeExp = (i) => setExperience((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="surface w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-main">Review extracted data</h2>
            <p className="mt-1 text-sm text-muted">
              {deepseekUsed ? "Extracted by DeepSeek AI." : "Extracted with keyword matching (add your DeepSeek API key for better results)."}{" "}
              Uncheck anything you don't want added.
            </p>
          </div>
          <button onClick={onCancel} className="text-muted hover:text-main text-xl font-black">×</button>
        </div>

        {skills.length > 0 && (
          <section className="mb-5">
            <p className="mb-2 text-sm font-black uppercase tracking-wide text-muted">Skills</p>
            <div className="flex flex-wrap gap-2">
              {(extracted.skills || []).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-md px-3 py-1 text-sm font-bold transition ${
                    skills.includes(skill)
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-soft)] text-muted line-through"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </section>
        )}

        {interests.length > 0 && (
          <section className="mb-5">
            <p className="mb-2 text-sm font-black uppercase tracking-wide text-muted">Interests</p>
            <div className="flex flex-wrap gap-2">
              {(extracted.interests || []).map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-md px-3 py-1 text-sm font-bold transition ${
                    interests.includes(interest)
                      ? "badge badge-blue"
                      : "bg-[var(--surface-soft)] text-muted line-through"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-5">
            <p className="mb-2 text-sm font-black uppercase tracking-wide text-muted">Education</p>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="surface-flat flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-black text-main">{edu.college || "Unknown college"}</p>
                    <p className="text-xs text-muted">
                      {[edu.degree, edu.branch, edu.graduation_year].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button onClick={() => removeEdu(i)} className="text-muted hover:text-rose-500 text-lg">×</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-5">
            <p className="mb-2 text-sm font-black uppercase tracking-wide text-muted">Experience</p>
            <div className="space-y-2">
              {experience.map((exp, i) => (
                <div key={i} className="surface-flat flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-black text-main">{exp.role} at {exp.company}</p>
                    <p className="text-xs text-muted">{[exp.duration, exp.description].filter(Boolean).join(" · ").slice(0, 100)}</p>
                  </div>
                  <button onClick={() => removeExp(i)} className="text-muted hover:text-rose-500 text-lg">×</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length === 0 && education.length === 0 && experience.length === 0 && interests.length === 0 && (
          <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            Nothing could be extracted from this file. Try a different PDF or add your DeepSeek API key for better parsing.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onConfirm({ skills, education, experience, interests, current_role: extracted.current_role, summary: extracted.summary })}
            className="btn-primary flex-1 py-3 text-sm"
            disabled={skills.length === 0 && education.length === 0 && experience.length === 0}
          >
            Add to profile
          </button>
          <button onClick={onCancel} className="btn-secondary px-5 py-3 text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ExtractionPreview;
