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

export const getMatches = ({ jobId, job, deiMode = false }) =>
  request("/api/match", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId, job, dei_mode: deiMode }),
  });

export const submitProof = ({ candidateId, solution }) =>
  request("/api/proof/submit", {
    method: "POST",
    body: JSON.stringify({ candidate_id: candidateId, solution }),
  });

export const createReferralRequest = ({ candidateId, employeeId, jobId, job, message }) =>
  request("/api/referral-requests", {
    method: "POST",
    body: JSON.stringify({
      candidate_id: candidateId,
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

export const getRecruiterData = () => request("/api/recruiter-dashboard");

export const sourceRecruiterProfiles = ({ jobUrl }) =>
  request("/api/recruiter-search", {
    method: "POST",
    body: JSON.stringify({ job_url: jobUrl }),
  });

export const markRecruiterReferral = ({ job, profile }) =>
  request("/api/recruiter-referrals", {
    method: "POST",
    body: JSON.stringify({ job, profile }),
  });

export const getCandidates = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return request(`/api/candidates${params.toString() ? `?${params}` : ""}`);
};

export const getRecruiters = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return request(`/api/recruiters${params.toString() ? `?${params}` : ""}`);
};

export const createConnection = ({ fromType, fromId, toType, toId, note }) =>
  request("/api/connections", {
    method: "POST",
    body: JSON.stringify({
      from_type: fromType,
      from_id: fromId,
      to_type: toType,
      to_id: toId,
      note,
    }),
  });

export const sendMessage = ({ connectionId, senderType, senderId, body }) =>
  request("/api/messages", {
    method: "POST",
    body: JSON.stringify({
      connection_id: connectionId,
      sender_type: senderType,
      sender_id: senderId,
      body,
    }),
  });

export const getMessages = (connectionId) => request(`/api/messages?connection_id=${encodeURIComponent(connectionId)}`);

export const generateMessage = ({ candidateId, employeeId, jobId, job }) =>
  request("/api/generate-message", {
    method: "POST",
    body: JSON.stringify({
      candidate_id: candidateId,
      employee_id: employeeId,
      job_id: jobId,
      job,
    }),
  });

export const getCareerCompanion = ({ candidateId, jobId, job, profile }) =>
  request("/api/ai/career-companion", {
    method: "POST",
    body: JSON.stringify({
      candidate_id: candidateId,
      job_id: jobId,
      job,
      profile,
    }),
  });
