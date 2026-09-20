// ---------------------------------------------------------------
// API SERVICE LAYER
// ---------------------------------------------------------------
// This is the ONLY place UI components should reach for data/auth
// operations. Right now everything is mocked with localStorage +
// setTimeout to simulate network latency. When the Spring Boot
// backend is ready, swap the internals of each function below to
// real fetch()/axios calls — no component code should need to change,
// since every function still returns a Promise with the same shape.
//
// Suggested real endpoints (Spring Boot):
//   POST /api/auth/signup
//   POST /api/auth/login
//   POST /api/auth/forgot-password
//   POST /api/auth/reset-password
//   GET/PUT /api/profile
//   GET /api/careers
//   GET /api/careers/:id
//   POST /api/assessment/submit
//   GET /api/mentors
//   POST /api/mentors/:id/chat
// ---------------------------------------------------------------

import { careers } from "../data/careers";
import { mentors, getMockMentorReply } from "../data/mentors";

const LATENCY = 500;
const BACKEND_BASE_URL = "http://localhost:8080";
const SERVER_ERROR_MESSAGE = "Unable to connect to the server. Please try again.";

const delay = (data, ms = LATENCY) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

const SESSION_KEY = "pathwise_session";
const PROFILE_KEY = "pathwise_profile";

const requestJson = async (path, options) => {
  let response;

  try {
    response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(SERVER_ERROR_MESSAGE);
  }

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || text || SERVER_ERROR_MESSAGE);
  }

  return data;
};

const normalizeBackendUser = (user) => ({
  id: user.id,
  fullName: user.name,
  email: user.email,
});

const normalizeList = (value) =>
  typeof value === "string"
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value
      : [];

const normalizeBackendCareer = (career) => ({
  id: career.careerId,
  title: career.title,
  tagline: career.tagline,
  description: career.description,
  skills: normalizeList(career.skills),
  responsibilities: normalizeList(career.responsibilities),
  growth: career.growth,
  salaryRange: career.salaryRange,
  market: {
    avgSalary: career.avgSalary,
    demand: career.demand,
    topLocation: career.topLocation,
    globalOpportunities: career.globalOpportunities,
  },
});

export const authApi = {
  signup: async ({ fullName, email, password }) => {
    try {
      const data = await requestJson("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name: fullName, email, password }),
      });
      const user = normalizeBackendUser(data.user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { success: true, user, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || SERVER_ERROR_MESSAGE };
    }
  },

  login: async ({ email, password }) => {
    try {
      const data = await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const user = normalizeBackendUser(data.user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { success: true, user, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || SERVER_ERROR_MESSAGE };
    }
  },

  forgotPassword: async (email) => {
    return delay({ success: true, message: `Reset link sent to ${email} (mocked).` });
  },

  resetPassword: async (_newPassword) => {
    return delay({ success: true, message: "Password reset successful." });
  },

  logout: async () => {
    localStorage.removeItem(SESSION_KEY);
    return delay({ success: true });
  },

  getSession: () => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const user = JSON.parse(raw);
      if (!Number.isInteger(user?.id) || user.id <= 0) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return user;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },
};

export const profileApi = {
  saveProfile: async (profile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return delay({ success: true, profile });
  },
  getProfile: () => {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};

export const careerApi = {
  getAll: async () => {
    try {
      const careersFromApi = await requestJson("/api/careers");
      return careersFromApi.map(normalizeBackendCareer);
    } catch {
      return [];
    }
  },
  getById: async (id) => delay(careers.find((c) => c.id === id) || null),
  getRecommendations: async (userId) => {
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
      return { success: false, message: "A valid backend user ID is required." };
    }

    try {
      const recommendations = await requestJson(`/api/careers/recommendations/${userId}`);
      return { success: true, recommendations };
    } catch (error) {
      return { success: false, message: error.message || SERVER_ERROR_MESSAGE };
    }
  },
  getRecommendationByCareerId: async (userId, careerId) => {
    const response = await careerApi.getRecommendations(userId);
    if (!response.success) return response;

    const recommendation = response.recommendations.find(
      (item) => item.careerId === careerId
    );

    if (!recommendation) {
      return {
        success: false,
        message: "Personalized match data is unavailable for this career.",
      };
    }

    return { success: true, recommendation };
  },
  getDetailsById: async (id) => {
    try {
      const career = await requestJson(`/api/careers/${id}`);
      return { success: true, career: normalizeBackendCareer(career) };
    } catch (error) {
      return { success: false, message: error.message || SERVER_ERROR_MESSAGE };
    }
  },
};

export const mentorApi = {
  getAll: async () => delay(mentors),
  getById: async (id) => delay(mentors.find((m) => m.id === id) || null),
  sendMessage: async (mentor, message) =>
    delay({ reply: getMockMentorReply(mentor, message) }, 700),
};

export const assessmentApi = {
  submit: async (answers, userId) => {
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
      return { success: false, message: "A valid backend user ID is required." };
    }

    if (!answers || Object.keys(answers).length !== 30) {
      return { success: false, message: "Please answer all 30 assessment questions." };
    }

    try {
      const data = await requestJson("/api/assessment/submit", {
        method: "POST",
        body: JSON.stringify({ userId, answers }),
      });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: error.message || SERVER_ERROR_MESSAGE };
    }
  },
};

export const skillAssessmentApi = {
  getQuestions: async (careerId) => {
    if (!careerId) {
      return { success: false, message: "A career is required for the skill assessment." };
    }

    try {
      const questions = await requestJson(`/api/skill-assessment/questions/${careerId}`);
      return { success: true, questions };
    } catch (error) {
      return { success: false, message: error.message || SERVER_ERROR_MESSAGE };
    }
  },

  submit: async ({ userId, careerId, answers }) => {
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
      return { success: false, message: "A valid backend user ID is required." };
    }
    if (!careerId || !Array.isArray(answers) || answers.length === 0) {
      return { success: false, message: "Please answer all skill assessment questions." };
    }

    try {
      const data = await requestJson("/api/skill-assessment/submit", {
        method: "POST",
        body: JSON.stringify({ userId, careerId, answers }),
      });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: error.message || SERVER_ERROR_MESSAGE };
    }
  },

  getSkillGap: async (userId, careerId) => {
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
      return { success: false, message: "A valid backend user ID is required." };
    }
    if (!careerId) {
      return { success: false, message: "A career is required for skill gap analysis." };
    }

    try {
      const data = await requestJson(`/api/skill-gap/${userId}/${careerId}`);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: error.message || SERVER_ERROR_MESSAGE };
    }
  },
};
