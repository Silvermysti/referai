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

export const getHealth = () => request("/api/health");

export const getMarketplace = () => request("/api/marketplace");

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

export const parseJob = (jobUrl) =>
  request("/api/parse-job", {
    method: "POST",
    body: JSON.stringify({ job_url: jobUrl }),
  });

export const getMatches = ({ jobId, job, userId }) =>
  request("/api/match", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId, job, user_id: userId }),
  });

export const submitProof = ({ userId, solution }) =>
  request("/api/proof/submit", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, solution }),
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

export const getReferralRequests = () => request("/api/referral-requests");

export const submitReferralDecision = ({ requestId, decision, notes }) =>
  request(`/api/referral-requests/${requestId}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, notes }),
  });

export const getUsers = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return request(`/api/users${params.toString() ? `?${params}` : ""}`);
};

export const createConnection = ({ userId, employeeId, connectionType = "cold" }) =>
  request("/api/connections", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, employee_id: employeeId, connection_type: connectionType }),
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
