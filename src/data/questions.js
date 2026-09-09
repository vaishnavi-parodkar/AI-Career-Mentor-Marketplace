// 30 mock assessment questions. Each maps loosely to a trait used
// to compute a mock result on the client. Backend will eventually
// own scoring logic.

const traits = ["analytical", "technical", "communication", "leadership", "creative"];

const statements = [
  "I enjoy solving analytical and logical problems.",
  "I like working with numbers, data and patterns.",
  "I enjoy figuring out how software and systems work.",
  "I like writing code or building things with technology.",
  "I feel comfortable speaking in front of a group.",
  "I enjoy explaining complex ideas in simple terms.",
  "I like taking charge and organizing a team's work.",
  "I feel energized when leading a project to completion.",
  "I enjoy coming up with new and original ideas.",
  "I like designing things — visuals, products or experiences.",
  "I prefer structured tasks with clear steps over ambiguity.",
  "I enjoy debugging problems until I find the root cause.",
  "I like negotiating and resolving conflicts between people.",
  "I enjoy mentoring or teaching others.",
  "I like working with spreadsheets, dashboards or reports.",
  "I enjoy learning new programming languages or tools.",
  "I like presenting my work to stakeholders or clients.",
  "I enjoy setting goals and tracking progress toward them.",
  "I like brainstorming unconventional solutions to problems.",
  "I enjoy understanding user needs before building a solution.",
  "I like working independently on deep-focus tasks.",
  "I enjoy collaborating closely with a team every day.",
  "I like analyzing risks before making a decision.",
  "I enjoy researching trends and market data.",
  "I like planning timelines and coordinating people.",
  "I enjoy troubleshooting technical issues under pressure.",
  "I like reading and writing detailed documentation.",
  "I enjoy pitching ideas and convincing others.",
  "I like experimenting with new tools before others adopt them.",
  "I enjoy reflecting on feedback to improve my work.",
];

export const questions = statements.map((text, i) => ({
  id: i + 1,
  text,
  trait: traits[i % traits.length],
}));

export const options = [
  { value: 2, label: "Strongly Agree" },
  { value: 1, label: "Agree" },
  { value: 0, label: "Neutral" },
  { value: -1, label: "Disagree" },
];

// Compute a mock result summary from answers: { [questionId]: value }
export const computeAssessmentResult = (answers) => {
  const totals = {};
  const counts = {};
  questions.forEach((q) => {
    const val = answers[q.id] ?? 0;
    totals[q.trait] = (totals[q.trait] || 0) + val;
    counts[q.trait] = (counts[q.trait] || 0) + 1;
  });

  const scores = Object.keys(totals).map((trait) => ({
    trait,
    score: totals[trait] / counts[trait],
  }));

  scores.sort((a, b) => b.score - a.score);
  const top = scores[0]?.trait || "analytical";

  const traitCopy = {
    analytical: {
      interest: "Analyzing data, solving problems",
      strength: "Analytical thinking, problem solving",
      preference: "Data-driven analytical work",
    },
    technical: {
      interest: "Building and understanding technology",
      strength: "Technical aptitude, logical reasoning",
      preference: "Hands-on technical work",
    },
    communication: {
      interest: "Explaining ideas and connecting with people",
      strength: "Communication, storytelling",
      preference: "People-facing, collaborative work",
    },
    leadership: {
      interest: "Organizing teams and driving outcomes",
      strength: "Leadership, decision-making",
      preference: "Ownership-driven, cross-functional work",
    },
    creative: {
      interest: "Designing and imagining new possibilities",
      strength: "Creativity, original thinking",
      preference: "Open-ended, design-driven work",
    },
  };

  return {
    topTrait: top,
    topInterest: traitCopy[top].interest,
    strengths: traitCopy[top].strength,
    workPreference: traitCopy[top].preference,
    scores,
  };
};
