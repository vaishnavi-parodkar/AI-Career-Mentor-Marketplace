// Mock-interview question bank.
//
// Used (a) as the fallback when the AI backend is unavailable and (b) as the
// source of expected keywords for the offline answer scorer.
// Keywords are lower-case stems matched against the candidate's answer.

import { careers } from "./careers";

export const INTERVIEW_CATEGORIES = {
  behavioral: "Behavioral",
  technical: "Technical",
  situational: "Situational",
};

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 10;
export const DEFAULT_QUESTIONS = 5;

// Asked for every career. No keywords: these are judged on structure, not facts.
const commonQuestions = [
  {
    id: "common-intro",
    category: "behavioral",
    text: "Tell me about yourself and why you're interested in this role.",
    hint: "Present, past, future: what you do now, what got you here, why this role is next.",
    keywords: [],
  },
  {
    id: "common-challenge",
    category: "behavioral",
    text: "Describe a challenging problem you solved recently. How did you approach it?",
    hint: "Use STAR: Situation, Task, Action, Result. Spend most of your time on the action and result.",
    keywords: [],
  },
  {
    id: "common-priorities",
    category: "behavioral",
    text: "How do you prioritize tasks when you're working on several things at once?",
    hint: "Name a real method (deadlines, impact, dependencies) and give a short example.",
    keywords: [],
  },
  {
    id: "common-learning",
    category: "behavioral",
    text: "What is your process for learning a new tool or skill quickly?",
    hint: "Describe concrete steps and one thing you recently learned this way.",
    keywords: [],
  },
  {
    id: "common-conflict",
    category: "behavioral",
    text: "Tell me about a time you disagreed with a teammate. How did you handle it?",
    hint: "Focus on how you listened and reached a resolution, not on who was right.",
    keywords: [],
  },
  {
    id: "common-mistake",
    category: "behavioral",
    text: "Tell me about a mistake you made. What did you learn from it?",
    hint: "Own it, explain the fix, and say what you now do differently.",
    keywords: [],
  },
];

const careerQuestions = {
  "data-analyst": [
    {
      id: "da-1",
      category: "technical",
      text: "How would you clean a messy dataset with missing values and duplicates before analysis?",
      hint: "Mention profiling the data, deciding how to treat nulls, de-duplication, and validating the result.",
      keywords: ["missing", "null", "duplicate", "outlier", "validate", "profile", "impute", "format"],
    },
    {
      id: "da-2",
      category: "technical",
      text: "Explain the difference between INNER JOIN and LEFT JOIN, and when you would use each.",
      hint: "Use a small example with two tables.",
      keywords: ["inner", "left", "join", "match", "null", "all rows", "table"],
    },
    {
      id: "da-3",
      category: "technical",
      text: "How do you decide which chart to use to present a result to non-technical stakeholders?",
      hint: "Tie the chart type to the question being answered and the audience.",
      keywords: ["audience", "trend", "comparison", "distribution", "bar", "line", "simple", "story"],
    },
    {
      id: "da-4",
      category: "situational",
      text: "Sales dropped 15% last month. Walk me through how you would investigate.",
      hint: "Segment first (region, product, channel, time), check data quality, then form hypotheses.",
      keywords: ["segment", "region", "product", "compare", "hypothes", "data quality", "seasonal", "trend"],
    },
    {
      id: "da-5",
      category: "technical",
      text: "What is the difference between correlation and causation? Give an example.",
      hint: "Give a concrete example of a confounding variable.",
      keywords: ["correlat", "causa", "confound", "experiment", "a/b", "example", "third variable"],
    },
    {
      id: "da-6",
      category: "situational",
      text: "A stakeholder disagrees with your analysis because it contradicts their intuition. What do you do?",
      hint: "Stay curious, show the evidence, and check whether they know something the data misses.",
      keywords: ["evidence", "listen", "data", "assumption", "explain", "validate", "visual"],
    },
  ],
  "software-developer": [
    {
      id: "sd-1",
      category: "technical",
      text: "Explain how you would debug a feature that works locally but fails in production.",
      hint: "Think environment differences, logs, config, data, and how you'd reproduce it.",
      keywords: ["log", "environment", "config", "reproduce", "difference", "monitor", "data", "version"],
    },
    {
      id: "sd-2",
      category: "technical",
      text: "What is the difference between an array and a linked list? When would you choose each?",
      hint: "Compare access, insertion, memory layout, and give a use case.",
      keywords: ["index", "constant", "o(1)", "o(n)", "insert", "memory", "pointer", "traverse"],
    },
    {
      id: "sd-3",
      category: "technical",
      text: "How would you design a URL shortener? Cover the main components and trade-offs.",
      hint: "Start with requirements, then API, storage, ID generation, and scaling.",
      keywords: ["database", "hash", "id", "collision", "cache", "scale", "redirect", "api", "load"],
    },
    {
      id: "sd-4",
      category: "technical",
      text: "What makes code easy to maintain? What do you look for in a code review?",
      hint: "Mention readability, tests, small functions, naming, and being constructive.",
      keywords: ["readab", "test", "naming", "simple", "review", "refactor", "duplicate", "document"],
    },
    {
      id: "sd-5",
      category: "technical",
      text: "Explain REST APIs and how you would handle errors and versioning in one.",
      hint: "Mention HTTP methods, status codes, and how you would avoid breaking existing clients.",
      keywords: ["get", "post", "status", "code", "json", "version", "error", "stateless", "endpoint"],
    },
    {
      id: "sd-6",
      category: "situational",
      text: "You inherit a legacy codebase with no tests and a looming deadline. How do you start?",
      hint: "Be pragmatic: understand it, add tests around risky areas, change in small steps.",
      keywords: ["test", "understand", "small", "risk", "document", "refactor", "prioriti", "incremental"],
    },
  ],
  "project-manager": [
    {
      id: "pm-1",
      category: "technical",
      text: "How do you build a project plan and keep it realistic when requirements are still evolving?",
      hint: "Mention scope, milestones, estimates, buffers, and regular re-planning.",
      keywords: ["scope", "milestone", "estimate", "stakeholder", "buffer", "risk", "iterat", "timeline"],
    },
    {
      id: "pm-2",
      category: "technical",
      text: "What is the difference between Agile and Waterfall? When would you choose each?",
      hint: "Link the method to how stable the requirements are and how fast feedback is needed.",
      keywords: ["agile", "waterfall", "sprint", "iterat", "requirement", "feedback", "sequential", "change"],
    },
    {
      id: "pm-3",
      category: "situational",
      text: "Your project is two weeks behind schedule. What do you do?",
      hint: "Diagnose the cause, then discuss options such as scope, resources and timeline with stakeholders.",
      keywords: ["cause", "scope", "resource", "stakeholder", "communicate", "prioriti", "risk", "plan"],
    },
    {
      id: "pm-4",
      category: "technical",
      text: "How do you identify and manage project risks?",
      hint: "Cover identification, probability and impact, mitigation, and ownership.",
      keywords: ["risk", "impact", "probab", "mitigat", "register", "owner", "monitor", "contingency"],
    },
    {
      id: "pm-5",
      category: "situational",
      text: "Two senior stakeholders want conflicting features prioritized. How do you resolve it?",
      hint: "Use shared criteria like value, cost and goals, and make the trade-off visible.",
      keywords: ["priorit", "criteria", "value", "goal", "trade", "align", "data", "decision"],
    },
    {
      id: "pm-6",
      category: "technical",
      text: "How do you measure whether a project was successful?",
      hint: "Go beyond on-time and on-budget: outcomes, quality, and stakeholder satisfaction.",
      keywords: ["kpi", "metric", "budget", "schedule", "quality", "satisf", "outcome", "goal"],
    },
  ],
  "product-manager": [
    {
      id: "prm-1",
      category: "technical",
      text: "How do you decide what to build next when you have many competing ideas?",
      hint: "Mention user problems, impact vs. effort, and how you validate with data or research.",
      keywords: ["user", "impact", "effort", "prioriti", "data", "research", "goal", "framework"],
    },
    {
      id: "prm-2",
      category: "technical",
      text: "Which metrics would you track for a new food-delivery app, and why?",
      hint: "Pick a north-star metric and a few supporting ones across acquisition, activation and retention.",
      keywords: ["retention", "activation", "conversion", "orders", "north star", "churn", "metric", "funnel"],
    },
    {
      id: "prm-3",
      category: "situational",
      text: "Engineering says a feature will take twice as long as expected. How do you respond?",
      hint: "Understand why, explore scope cuts, and re-evaluate whether it is still worth it.",
      keywords: ["scope", "understand", "trade", "mvp", "prioriti", "engineer", "communicate", "value"],
    },
    {
      id: "prm-4",
      category: "technical",
      text: "How would you validate a product idea before investing in building it?",
      hint: "Think interviews, prototypes, smoke tests, and clear success criteria.",
      keywords: ["interview", "prototype", "survey", "mvp", "hypothes", "test", "customer", "validate"],
    },
    {
      id: "prm-5",
      category: "situational",
      text: "A feature you launched has low adoption. What do you do?",
      hint: "Find where users drop off and talk to them before changing anything.",
      keywords: ["data", "user", "funnel", "feedback", "interview", "hypothes", "iterate", "drop"],
    },
    {
      id: "prm-6",
      category: "behavioral",
      text: "Tell me about a time you influenced a decision without having direct authority.",
      hint: "Show how you built the case with evidence and brought people along.",
      keywords: [],
    },
  ],
  "hr-specialist": [
    {
      id: "hr-1",
      category: "technical",
      text: "Walk me through how you would run the hiring process for a new role from start to finish.",
      hint: "Cover role definition, sourcing, screening, structured interviews, and offer.",
      keywords: ["job description", "source", "screen", "interview", "structured", "offer", "criteria", "onboard"],
    },
    {
      id: "hr-2",
      category: "situational",
      text: "Two employees are in a conflict that is affecting the team. How do you handle it?",
      hint: "Listen to both sides separately, stay neutral, document, and agree on next steps.",
      keywords: ["listen", "neutral", "confidential", "document", "mediat", "policy", "both", "resolve"],
    },
    {
      id: "hr-3",
      category: "technical",
      text: "How do you reduce bias in recruitment and performance reviews?",
      hint: "Mention structured criteria, diverse panels and consistent evaluation.",
      keywords: ["bias", "structured", "criteria", "diverse", "consistent", "objective", "blind", "training"],
    },
    {
      id: "hr-4",
      category: "technical",
      text: "Which metrics would you use to understand employee engagement and retention?",
      hint: "Examples: turnover, eNPS, exit interview themes, time-to-productivity.",
      keywords: ["turnover", "survey", "enps", "exit", "retention", "engagement", "feedback", "metric"],
    },
    {
      id: "hr-5",
      category: "situational",
      text: "A manager asks you to fast-track a candidate who skipped part of the interview process. What do you do?",
      hint: "Balance business pressure with fairness, consistency and compliance.",
      keywords: ["fair", "consistent", "process", "policy", "compliance", "explain", "risk", "exception"],
    },
    {
      id: "hr-6",
      category: "technical",
      text: "How would you deliver difficult feedback or a termination conversation?",
      hint: "Be clear, empathetic and documented; follow policy and law.",
      keywords: ["clear", "empath", "document", "policy", "legal", "respect", "private", "support"],
    },
  ],
  "cybersecurity-analyst": [
    {
      id: "cs-1",
      category: "technical",
      text: "What is the difference between symmetric and asymmetric encryption? Where is each used?",
      hint: "Mention key handling, speed, and a real example like TLS.",
      keywords: ["key", "symmetric", "asymmetric", "public", "private", "tls", "speed", "aes", "rsa"],
    },
    {
      id: "cs-2",
      category: "situational",
      text: "You notice unusual outbound traffic from a server at 3 a.m. How do you respond?",
      hint: "Follow incident response: identify, contain, investigate, eradicate, recover, review.",
      keywords: ["contain", "isolate", "log", "investigate", "incident", "escalat", "evidence", "siem"],
    },
    {
      id: "cs-3",
      category: "technical",
      text: "Explain the OWASP Top 10 category 'injection' and how to prevent it.",
      hint: "Give SQL injection as an example and name parameterized queries and input validation.",
      keywords: ["sql", "inject", "parameter", "prepared", "validat", "sanitiz", "input", "least privilege"],
    },
    {
      id: "cs-4",
      category: "technical",
      text: "How would you conduct a basic risk assessment for a small company?",
      hint: "Assets, threats, vulnerabilities, likelihood, impact, and mitigation priorities.",
      keywords: ["asset", "threat", "vulnerab", "likelihood", "impact", "mitigat", "prioriti", "risk"],
    },
    {
      id: "cs-5",
      category: "technical",
      text: "What is the principle of least privilege and how do you apply it in practice?",
      hint: "Mention access reviews, roles, and removing unused permissions.",
      keywords: ["least privilege", "access", "role", "permission", "review", "need", "minimum", "rbac"],
    },
    {
      id: "cs-6",
      category: "situational",
      text: "An executive asks you to disable a security control because it slows them down. What do you do?",
      hint: "Explain the risk in business terms and offer an alternative.",
      keywords: ["risk", "explain", "alternative", "policy", "business", "exception", "document", "approve"],
    },
  ],
};

const findCareer = (careerId) => careers.find((c) => c.id === careerId);

// Careers the user can practise for (id + title + skills), derived from the
// app's existing career list so the two never drift apart.
export const interviewCareers = careers.map((c) => ({
  id: c.id,
  title: c.title,
  skills: c.skills,
}));

export const getCareerTitle = (careerId) => findCareer(careerId)?.title || "General";

// Fisher–Yates; returns a new array.
const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Builds a question set: always opens with the intro question, then mixes
// career-specific and common behavioral questions.
export const buildLocalQuestionSet = (careerId, count = DEFAULT_QUESTIONS) => {
  const total = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, count));
  const [intro, ...otherCommon] = commonQuestions;
  const specific = careerQuestions[careerId] || [];

  const behavioralTarget = Math.max(1, Math.floor((total - 1) / 3));
  const specificTarget = total - 1 - behavioralTarget;

  const picked = [
    ...shuffle(specific).slice(0, specificTarget),
    ...shuffle(otherCommon).slice(0, behavioralTarget),
  ];

  // If the career has few questions, top up from the common pool.
  if (picked.length < total - 1) {
    const used = new Set(picked.map((q) => q.id));
    const topUp = shuffle(otherCommon).filter((q) => !used.has(q.id));
    picked.push(...topUp.slice(0, total - 1 - picked.length));
  }

  return [intro, ...shuffle(picked)].map((q) => ({ ...q }));
};
