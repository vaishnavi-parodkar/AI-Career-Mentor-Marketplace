import { careers } from "../data/careers";
// ---------------------------------------------------------------
// API SERVICE LAYER
// ---------------------------------------------------------------
// This file is the bridge between the React frontend and the
// Spring Boot backend.
//
// Frontend: http://localhost:5173
// Backend:  http://localhost:8080
// ---------------------------------------------------------------

const API_BASE_URL = "http://localhost:8080/api";

// Small helper for all HTTP requests
const request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message:
          data.message ||
          data.error ||
          "Something went wrong. Please try again.",
      };
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);

    return {
      success: false,
      message:
        "Unable to connect to the server. Please make sure the backend is running.",
    };
  }
};

// ---------------------------------------------------------------
// AUTHENTICATION
// ---------------------------------------------------------------

const SESSION_KEY = "pathwise_session";

export const authApi = {
  signup: async ({ fullName, email, password }) => {
    const result = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: fullName,
        email,
        password,
      }),
    });

    if (result.success && result.user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
    }

    return result;
  },

  login: async ({ email, password }) => {
    const result = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (result.success && result.user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
    }

    return result;
  },

  // Google login is still not connected to the backend.
  // We leave this temporarily so the existing frontend does not break.
  googleLogin: async () => {
    return {
      success: false,
      message: "Google login is not connected yet.",
    };
  },

  forgotPassword: async (email) => {
    return request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (newPassword) => {
    return request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
  },

  logout: async () => {
    localStorage.removeItem(SESSION_KEY);

    return {
      success: true,
    };
  },

  getSession: () => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};

// ---------------------------------------------------------------
// CAREER PROFILE
// ---------------------------------------------------------------

export const profileApi = {
  saveProfile: async (profile) => {
    const result = await request("/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    });

    return result;
  },

  getProfile: async (userId) => {
    return request(`/profile/${userId}`, {
      method: "GET",
    });
  },

  updateProfile: async (profile) => {
    return request("/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  },
};

// ---------------------------------------------------------------
// CAREERS
// ---------------------------------------------------------------
// Backend career API is already available.
// We keep these calls here so the frontend can eventually use
// the database instead of mock career data.

// ---------------------------------------------------------------
// CAREERS
// ---------------------------------------------------------------
// Converts the Spring Boot career response into the format
// expected by the existing React career pages.
// ---------------------------------------------------------------

const normalizeCareer = (career) => {
  const scores = [
    career.analyticalScore ?? 0,
    career.technicalScore ?? 0,
    career.communicationScore ?? 0,
    career.leadershipScore ?? 0,
    career.creativeScore ?? 0,
  ];

  const match = Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length
  );

  return {
    ...career,

    // React uses this as the URL ID.
    // Backend expects values like "data-analyst".
    id: career.careerId,

    // Convert comma-separated database strings into arrays.
    skills: career.skills
      ? career.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [],

    responsibilities: career.responsibilities
      ? career.responsibilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],

    // Match score used by CareerCard and CareerDetail.
    match,

    // Convert backend market fields into the structure
    // expected by CareerDetail.jsx.
    market: {
      avgSalary: career.avgSalary || "Not available",
      demand: career.demand || "Not available",
      topLocation: career.topLocation || "Not available",
      globalOpportunities:
        career.globalOpportunities || "Not available",
    },
  };
};

export const careerApi = {
  getAll: async () => {
    const result = await request("/careers", {
      method: "GET",
    });

    if (result && result.success === false) {
      return result;
    }

    return Array.isArray(result)
      ? result.map(normalizeCareer)
      : [];
  },

  getById: async (id) => {
    const result = await request(`/careers/${id}`, {
      method: "GET",
    });

    if (result && result.success === false) {
      return result;
    }

    return result ? normalizeCareer(result) : null;
  },
};

// ---------------------------------------------------------------
// MENTORS
// ---------------------------------------------------------------
// Not part of your current first-three-feature assignment.
// Kept as mock data for now so your friend's frontend continues
// to work.

import { mentors, getMockMentorReply } from "../data/mentors";

export const mentorApi = {
  getAll: async () => mentors,

  getById: async (id) => {
    return mentors.find((mentor) => mentor.id === id) || null;
  },

  sendMessage: async (mentor, message) => ({
    reply: getMockMentorReply(mentor, message),
  }),
};

// ---------------------------------------------------------------
// CAREER ASSESSMENT
// ---------------------------------------------------------------

export const assessmentApi = {
  submit: async (userId, answers) => {
    return request("/assessment/submit", {
      method: "POST",
      body: JSON.stringify({
        userId,
        answers,
      }),
    });
  },
};