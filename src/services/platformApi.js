// All endpoints added for the full platform (jobs, resume, bookings, progress, reports, admin ...).
import { request, download } from "./http";

const qs = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "all") q.set(k, v);
  });
  const text = q.toString();
  return text ? `?${text}` : "";
};

export const jobsApi = {
  search: (params) => request(`/api/jobs${qs(params)}`, { timeoutMs: 60000 }),
  insights: (careerId) => request(`/api/market/insights${qs({ careerId })}`, { timeoutMs: 60000 }),
};

export const resumeApi = {
  analyze: ({ file, text, careerId, jobDescription }) => {
    const form = new FormData();
    if (file) form.append("file", file);
    if (text) form.append("text", text);
    if (careerId) form.append("careerId", careerId);
    if (jobDescription) form.append("jobDescription", jobDescription);
    return request("/api/resume/analyze", { method: "POST", body: form, timeoutMs: 90000 });
  },
  history: () => request("/api/resume/history"),
};

export const bookingApi = {
  slots: (mentorDbId) => request(`/api/bookings/slots/${mentorDbId}`),
  book: (payload) => request("/api/bookings", { method: "POST", body: payload }),
  mine: () => request("/api/bookings/mine"),
  cancel: (id) => request(`/api/bookings/${id}`, { method: "DELETE" }),
  prepare: (id) => request(`/api/bookings/${id}/prepare`, { method: "POST", timeoutMs: 60000 }),
  summarize: (id, notes) => request(`/api/bookings/${id}/summary`, { method: "POST", body: { notes }, timeoutMs: 60000 }),
  downloadIcs: (id) => download(`/api/bookings/${id}/ics`, "mentor-session.ics"),
  tasks: () => request("/api/bookings/tasks"),
  setTaskDone: (id, done) => request(`/api/bookings/tasks/${id}`, { method: "PATCH", body: { done } }),
};

export const progressApi = {
  dashboard: () => request("/api/progress/dashboard"),
  nextActions: () => request("/api/next-actions"),
  behavior: () => request("/api/behavior/analysis", { timeoutMs: 60000 }),
  saveSimulation: (payload) => request("/api/simulations", { method: "POST", body: payload }),
  saveInterview: (payload) => request("/api/interviews", { method: "POST", body: payload }),
  interviews: () => request("/api/interviews"),
  learning: (careerId) => request(`/api/learning${qs({ careerId })}`),
};

export const notificationApi = {
  list: () => request("/api/notifications"),
  readAll: () => request("/api/notifications/read-all", { method: "POST" }),
  read: (id) => request(`/api/notifications/${id}/read`, { method: "POST" }),
};

export const reportApi = {
  pdf: () => download("/api/reports/progress.pdf", "career-progress-report.pdf"),
  csv: () => download("/api/reports/progress.csv", "career-progress-report.csv"),
};

export const assistantApi = {
  ask: (message, { history = [], language = "en", page = "" } = {}) =>
    request("/api/marketplace/assistant", { method: "POST", body: { message, history, language, page }, timeoutMs: 60000 }),
};

export const adminApi = {
  stats: () => request("/api/admin/stats"),
  users: () => request("/api/admin/users"),
  setRole: (id, role) => request(`/api/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
  content: (pending = false) => request(`/api/admin/content?pending=${pending}`),
  addContent: (payload) => request("/api/admin/content", { method: "POST", body: payload }),
  setApproved: (id, approved) => request(`/api/admin/content/${id}`, { method: "PATCH", body: { approved } }),
  deleteContent: (id) => request(`/api/admin/content/${id}`, { method: "DELETE" }),
  mentors: () => request("/api/admin/mentors"),
  updateMentor: (id, mentor) => request(`/api/admin/mentors/${id}`, { method: "PUT", body: mentor }),
  broadcast: (title, message) => request("/api/admin/broadcast", { method: "POST", body: { title, message } }),
};
