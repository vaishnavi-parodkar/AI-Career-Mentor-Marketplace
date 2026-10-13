// ---------------------------------------------------------------
// MOCK INTERVIEW SERVICE
// ---------------------------------------------------------------
// Kept in its own file so the existing services/api.js is untouched.
//
// Backend endpoints (Spring Boot, Groq-powered):
//   POST /api/mock-interview/questions   -> AI-generated questions
//   POST /api/mock-interview/evaluate    -> AI feedback on the answers
//
// If the backend is down, slow, or has no GROQ_API_KEY, both calls quietly
// fall back to the local question bank / offline scorer, and the result is
// tagged with `source` so the UI can say which one produced it.
// ---------------------------------------------------------------

import {
  buildLocalQuestionSet,
  getCareerTitle,
  interviewCareers,
  INTERVIEW_CATEGORIES,
  MIN_QUESTIONS,
  MAX_QUESTIONS,
} from "../data/interviewBank";
import { evaluateLocally } from "./interviewEvaluator";

const BACKEND_BASE_URL = "http://localhost:8080";
const QUESTIONS_TIMEOUT_MS = 15000;
const EVALUATE_TIMEOUT_MS = 40000;
const HISTORY_LIMIT = 20;

const postJson = async (path, body, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

const clampScore = (value) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
};

const toStringList = (value, max = 6) =>
  (Array.isArray(value) ? value : typeof value === "string" ? [value] : [])
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, max);

// ---------------------------------------------------------------
// Questions
// ---------------------------------------------------------------

export const interviewApi = {
  /**
   * @returns {Promise<{questions: Array, source: "ai"|"bank"}>}
   */
  getQuestions: async ({ careerId, count }) => {
    const total = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, Number(count) || 5));
    const career = interviewCareers.find((c) => c.id === careerId);

    try {
      const data = await postJson(
        "/api/mock-interview/questions",
        { careerTitle: getCareerTitle(careerId), skills: career?.skills || [], count: total },
        QUESTIONS_TIMEOUT_MS
      );

      const questions = (Array.isArray(data?.questions) ? data.questions : [])
        .filter((q) => typeof q?.text === "string" && q.text.trim())
        .slice(0, total)
        .map((q, index) => ({
          id: `ai-${index + 1}`,
          text: q.text.trim(),
          category: Object.keys(INTERVIEW_CATEGORIES).includes(String(q.category).toLowerCase())
            ? String(q.category).toLowerCase()
            : "behavioral",
          hint: typeof q.hint === "string" ? q.hint.trim() : "",
          keywords: [],
        }));

      if (questions.length < MIN_QUESTIONS) throw new Error("Not enough questions returned");
      return { questions, source: "ai" };
    } catch {
      return { questions: buildLocalQuestionSet(careerId, total), source: "bank" };
    }
  },

  /**
   * Scores the answers (AI first, offline estimate as fallback) and returns the
   * full result object. Does not persist it; call saveResult for that.
   */
  evaluate: async ({ careerId, questions, answers }) => {
    const local = evaluateLocally(questions, answers);
    const answeredIndexes = local.questions
      .map((row, index) => (row.skipped ? -1 : index))
      .filter((index) => index >= 0);

    const base = {
      careerId,
      careerTitle: getCareerTitle(careerId),
      createdAt: new Date().toISOString(),
    };

    if (answeredIndexes.length === 0) return { ...base, ...local };

    try {
      const data = await postJson(
        "/api/mock-interview/evaluate",
        {
          careerTitle: base.careerTitle,
          answers: answeredIndexes.map((i) => ({
            question: local.questions[i].question,
            category: local.questions[i].category,
            answer: local.questions[i].answer,
          })),
        },
        EVALUATE_TIMEOUT_MS
      );

      const aiRows = Array.isArray(data?.questions) ? data.questions : [];
      if (aiRows.length !== answeredIndexes.length) throw new Error("Unexpected AI response");

      const rows = local.questions.map((row) => ({ ...row }));
      answeredIndexes.forEach((rowIndex, i) => {
        rows[rowIndex].score = clampScore(aiRows[i]?.score);
        const notes = toStringList(aiRows[i]?.feedback, 4);
        if (notes.length) rows[rowIndex].feedback = notes;
      });

      // Skipped questions count as 0, so overall is recomputed from the rows
      // rather than trusting the model's own average.
      const overall = Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length);

      return {
        ...base,
        overall,
        communication: clampScore(data.communication),
        technical: clampScore(data.technical),
        summary: String(data.summary || local.summary),
        strengths: toStringList(data.strengths).length ? toStringList(data.strengths) : local.strengths,
        weaknesses: toStringList(data.weaknesses).length ? toStringList(data.weaknesses) : local.weaknesses,
        recommendations: toStringList(data.recommendations).length
          ? toStringList(data.recommendations)
          : local.recommendations,
        questions: rows,
        source: "ai",
      };
    } catch {
      return { ...base, ...local };
    }
  },

  // -------------------------------------------------------------
  // History (localStorage, per signed-in user)
  // -------------------------------------------------------------
  saveResult: (userId, result) => {
    const saved = { ...result, id: `iv-${Date.now()}` };
    try {
      const history = interviewApi.getHistory(userId);
      localStorage.setItem(storageKey(userId), JSON.stringify([saved, ...history].slice(0, HISTORY_LIMIT)));
    } catch {
      // Storage full or blocked: the result still renders from navigation state.
    }
    return saved;
  },

  getHistory: (userId) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey(userId)) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  getResult: (userId, id) => {
    const history = interviewApi.getHistory(userId);
    return (id ? history.find((item) => item.id === id) : history[0]) || null;
  },
};

const storageKey = (userId) => `pathwise_mock_interviews_${userId ?? "guest"}`;
