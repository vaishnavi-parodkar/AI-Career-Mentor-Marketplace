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

const delay = (data, ms = LATENCY) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

const USERS_KEY = "pathwise_users";
const SESSION_KEY = "pathwise_session";
const PROFILE_KEY = "pathwise_profile";

const readUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const authApi = {
  signup: async ({ fullName, email, password }) => {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return delay({ success: false, message: "An account with this email already exists." });
    }
    const user = { id: crypto.randomUUID(), fullName, email, password };
    users.push(user);
    writeUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, fullName, email }));
    return delay({ success: true, user: { id: user.id, fullName, email } });
  },

  login: async ({ email, password }) => {
    const users = readUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      // Allow a frictionless demo login for evaluators
      if (email.toLowerCase() === "demo@pathwise.com" && password === "demo1234") {
        const demoUser = { id: "demo", fullName: "Demo User", email };
        localStorage.setItem(SESSION_KEY, JSON.stringify(demoUser));
        return delay({ success: true, user: demoUser });
      }
      return delay({ success: false, message: "Invalid email or password." });
    }
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: user.id, fullName: user.fullName, email: user.email })
    );
    return delay({ success: true, user: { id: user.id, fullName: user.fullName, email: user.email } });
  },

  googleLogin: async () => {
    const user = { id: "google-demo", fullName: "Google User", email: "google.user@gmail.com" };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return delay({ success: true, user });
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
    return raw ? JSON.parse(raw) : null;
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
  getAll: async () => delay(careers),
  getById: async (id) => delay(careers.find((c) => c.id === id) || null),
};

export const mentorApi = {
  getAll: async () => delay(mentors),
  getById: async (id) => delay(mentors.find((m) => m.id === id) || null),
  sendMessage: async (mentor, message) =>
    delay({ reply: getMockMentorReply(mentor, message) }, 700),
};

export const assessmentApi = {
  submit: async (answers) => delay({ success: true, answers }, 800),
};
