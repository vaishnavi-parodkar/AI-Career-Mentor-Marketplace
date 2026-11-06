// Offline interview scorer.
//
// This is a transparent, rule-based estimate used when the AI backend is not
// reachable. It measures HOW an answer is delivered (length, structure,
// specificity, filler words) and, for technical questions, how many of the
// expected key ideas it touches. It cannot verify that an answer is factually
// correct, so the UI labels these results as an "offline estimate".

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const avg = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

const SKIP_THRESHOLD_WORDS = 3;

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const FILLER_RE = /\b(um+|uh+|erm|you know|basically|kind of|sort of|literally|actually)\b/gi;
const RESULT_RE = /\b(result|outcome|as a result|resulting|reduced|increased|improved|saved|delivered|achieved|launched|shipped|learned|learnt|led to)\b/i;
const TASK_RE = /\b(responsible|goal|objective|needed to|had to|asked to|my task|my role|challenge|deadline|problem)\b/i;
const SITUATION_RE = /\b(when|while|during|last (year|month|semester|term)|at (my|the)|in (my|our|a) (project|team|internship|course|class|job)|our team|we were)\b/i;
const ACTION_RE = /\bI\s+(\w+ed|built|led|made|ran|wrote|chose|took|set up|began|started|spoke|met|found|did|decided|proposed|organi[sz]ed|used)\b/i;
const REASONING_RE = /\b(first|second|then|next|finally|because|therefore|so that|for example|for instance|trade-?off|however|which means)\b/i;
const EXAMPLE_RE = /\b(for example|for instance|such as|e\.g\.|when i|in my|one time|last )\b/i;
const NUMBER_RE = /\d/;

const lengthScore = (words) => {
  if (words < 15) return 10;
  if (words < 40) return 40;
  if (words < 60) return 65;
  if (words <= 200) return 100;
  if (words <= 300) return 80;
  return 65;
};

const analyseAnswer = (question, answer) => {
  const text = answer.trim();
  const words = countWords(text);
  const lower = text.toLowerCase();

  const fillerCount = (text.match(FILLER_RE) || []).length;
  const fillersPer100 = words ? (fillerCount / words) * 100 : 0;

  const hasSituation = SITUATION_RE.test(text);
  const hasTask = TASK_RE.test(text);
  const hasAction = ACTION_RE.test(text);
  const hasResult = RESULT_RE.test(text);
  const starParts = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length;

  const hasReasoning = REASONING_RE.test(text);
  const hasNumbers = NUMBER_RE.test(text);
  const hasExample = EXAMPLE_RE.test(text);

  const keywords = question.keywords || [];
  const matched = keywords.filter((k) => lower.includes(k.toLowerCase()));
  const keywordTarget = keywords.length ? Math.max(3, Math.ceil(keywords.length * 0.4)) : 0;
  const coverage = keywords.length ? Math.min(1, matched.length / keywordTarget) : null;

  const isBehavioral = question.category === "behavioral";
  const structure = isBehavioral
    ? (starParts / 4) * 100
    : hasReasoning ? 100 : words >= 40 ? 55 : 25;
  const specificity = (hasNumbers ? 50 : 0) + (hasExample ? 50 : 0);
  const clarity = clamp(100 - fillersPer100 * 20);
  const length = lengthScore(words);

  let score;
  if (coverage !== null) {
    score = 0.35 * coverage * 100 + 0.25 * length + 0.2 * structure + 0.1 * specificity + 0.1 * clarity;
  } else {
    score = 0.3 * length + 0.45 * structure + 0.15 * specificity + 0.1 * clarity;
  }

  const communication = 0.4 * length + 0.35 * clarity + 0.25 * structure;
  const technical = coverage !== null ? coverage * 70 + specificity * 0.3 : null;

  return {
    words,
    fillerCount,
    fillersPer100,
    hasResult,
    hasNumbers,
    hasExample,
    hasReasoning,
    starParts,
    coverage,
    matchedCount: matched.length,
    keywordCount: keywords.length,
    score: Math.round(clamp(score)),
    communication,
    technical,
  };
};

const buildQuestionFeedback = (question, a) => {
  const notes = [];

  if (a.words < 40) notes.push("Too short. Aim for roughly 60–150 words so you can show your reasoning.");
  else if (a.words > 250) notes.push("Quite long. Tighten it to your strongest points (about 90 seconds spoken).");

  if (question.category === "behavioral") {
    if (!a.hasResult) notes.push("Finish with the result: what changed because of what you did?");
    if (a.starParts < 3) notes.push("Structure it with STAR: Situation, Task, Action, Result.");
  } else if (a.coverage !== null && a.coverage < 0.7) {
    notes.push("Cover more of the core ideas interviewers expect for this topic.");
  }

  if (!a.hasNumbers) notes.push("Add a number or measurable outcome to make it concrete.");
  if (!a.hasExample && question.category !== "technical") notes.push("Back it up with a specific example.");
  if (a.fillersPer100 > 2) notes.push("Cut filler words (\"basically\", \"you know\", \"actually\").");

  if (notes.length === 0) notes.push("Well structured and specific. Keep this level of detail.");
  if (question.hint) notes.push(`Tip: ${question.hint}`);
  return notes.slice(0, 4);
};

const summaryLabel = (overall) => {
  if (overall >= 85) return "Excellent performance";
  if (overall >= 70) return "Good performance";
  if (overall >= 50) return "Getting there";
  return "Needs more practice";
};

/**
 * @param {Array<{id:string,text:string,category:string,hint?:string,keywords?:string[]}>} questions
 * @param {Record<string,string>} answers  map of question id -> answer text
 */
export const evaluateLocally = (questions, answers) => {
  const rows = questions.map((q) => {
    const answer = (answers[q.id] || "").trim();
    const skipped = countWords(answer) < SKIP_THRESHOLD_WORDS;

    if (skipped) {
      return {
        id: q.id,
        question: q.text,
        category: q.category,
        answer,
        skipped: true,
        score: 0,
        feedback: ["You skipped this question. Even a short, structured answer is better than none."],
        analysis: null,
      };
    }

    const analysis = analyseAnswer(q, answer);
    return {
      id: q.id,
      question: q.text,
      category: q.category,
      answer,
      skipped: false,
      score: analysis.score,
      feedback: buildQuestionFeedback(q, analysis),
      analysis,
    };
  });

  const answered = rows.filter((r) => !r.skipped);
  const analyses = answered.map((r) => r.analysis);

  const overall = Math.round(avg(rows.map((r) => r.score)));
  const communication = Math.round(clamp(avg(analyses.map((a) => a.communication))));
  const technicalValues = analyses.map((a) => a.technical).filter((v) => v !== null);
  const technical = Math.round(
    clamp(technicalValues.length ? avg(technicalValues) : avg(analyses.map((a) => a.score)))
  );

  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  const behavioralAnalyses = answered.filter((r) => r.category === "behavioral").map((r) => r.analysis);
  const resultRate = behavioralAnalyses.length
    ? behavioralAnalyses.filter((a) => a.hasResult).length / behavioralAnalyses.length
    : null;
  const avgWords = avg(analyses.map((a) => a.words));
  const numberRate = analyses.length ? analyses.filter((a) => a.hasNumbers).length / analyses.length : 0;
  const avgFillers = avg(analyses.map((a) => a.fillersPer100));
  const avgCoverage = avg(analyses.map((a) => a.coverage).filter((c) => c !== null));
  const hasCoverage = analyses.some((a) => a.coverage !== null);

  if (avgWords >= 60 && avgWords <= 200) strengths.push("Answers were a good length: detailed without rambling");
  if (resultRate !== null && resultRate >= 0.6) strengths.push("You described outcomes, not just what you did");
  if (numberRate >= 0.5) strengths.push("Good use of numbers and measurable details");
  if (avgFillers < 1 && analyses.length) strengths.push("Clean, confident wording with very few filler words");
  if (hasCoverage && avgCoverage >= 0.7) strengths.push("Covered most of the key ideas on the technical questions");
  if (answered.length === rows.length) strengths.push("You answered every question");
  if (strengths.length === 0) strengths.push(`You answered ${answered.length} of ${rows.length} questions. Every rep counts`);

  if (avgWords < 50) {
    weaknesses.push("Answers were short and didn't show enough reasoning");
    recommendations.push("Aim for 60–150 words per answer: claim, example, result");
  } else if (avgWords > 250) {
    weaknesses.push("Answers ran long and may lose the interviewer");
    recommendations.push("Lead with your main point, then cut to your two best details");
  }
  if (resultRate !== null && resultRate < 0.5) {
    weaknesses.push("Behavioral answers rarely ended with a clear result");
    recommendations.push("Practice the STAR method and always close with the outcome");
  }
  if (numberRate < 0.4) {
    weaknesses.push("Few measurable details (numbers, percentages, timeframes)");
    recommendations.push("Prepare 2–3 metrics-driven examples from past projects or coursework");
  }
  if (avgFillers >= 2) {
    weaknesses.push("Frequent filler words weaken your delivery");
    recommendations.push("Pause instead of using fillers; rehearse answers out loud");
  }
  if (hasCoverage && avgCoverage < 0.6) {
    weaknesses.push("Technical answers missed several core concepts");
    recommendations.push("Review the fundamentals for this role and explain each concept with a small example");
  }
  if (answered.length < rows.length) {
    weaknesses.push(`${rows.length - answered.length} question(s) were skipped`);
    recommendations.push("Attempt every question; a partial answer still shows how you think");
  }
  if (weaknesses.length === 0) weaknesses.push("No major weaknesses detected. Next, push for sharper, more concise answers");
  if (recommendations.length === 0) recommendations.push("Try a longer session or a harder role to keep stretching yourself");

  return {
    overall,
    communication,
    technical,
    summary: summaryLabel(overall),
    strengths,
    weaknesses,
    recommendations,
    questions: rows.map(({ analysis: _analysis, ...row }) => row),
    source: "offline",
  };
};
