const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "ReferAI service request failed");
  }

  return res.json();
};

export const startPhoneAuth = ({ phone }) =>
  request("/api/auth/phone/start", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });

export const authSignup = (profile) =>
  request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(profile),
  });

export const authLogin = ({ email, password }) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const parseJob = (jobDescription) =>
  request("/api/parse-job", {
    method: "POST",
    body: JSON.stringify({ job_description: jobDescription }),
  });

export const getMatches = ({ jobId, job, userId }) =>
  request("/api/match", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId, job, user_id: userId }),
  });

export const createReferralRequest = ({ userId, employeeId, jobId, job, message }) =>
  request("/api/referral-requests", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      employee_id: employeeId,
      job_id: jobId,
      job,
      message,
    }),
  });

export const generateMessage = ({ userId, employeeId, jobId, job }) =>
  request("/api/generate-message", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      employee_id: employeeId,
      job_id: jobId,
      job,
    }),
  });

export const getCareerCompanion = ({ userId, jobId, job, profile }) =>
  request("/api/ai/career-companion", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      job_id: jobId,
      job,
      profile,
    }),
  });

export const uploadResume = (file) => {
  const form = new FormData();
  form.append("file", file);
  return fetch(`${API_BASE}/api/profile/upload-resume`, { method: "POST", body: form })
    .then((res) => {
      if (!res.ok) return res.json().then((e) => { throw new Error(e.error || "Upload failed"); });
      return res.json();
    });
};

export const getJobRecommendations = (userId) =>
  request(`/api/jobs/recommendations?user_id=${encodeURIComponent(userId)}`);

export const updateProfile = ({ userId, skills, education, experience, interests, targetCompanies, currentRole, targetRole, summary }) =>
  request("/api/profile", {
    method: "PUT",
    body: JSON.stringify({
      user_id: userId,
      skills: skills || [],
      education: education || [],
      experience: experience || [],
      interests: interests || [],
      target_companies: targetCompanies || [],
      current_role: currentRole || "",
      target_role: targetRole || "",
      summary: summary || "",
    }),
  });
