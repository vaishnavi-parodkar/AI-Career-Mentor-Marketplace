// Client-side "AI" insights: blends assessment traits with profile skills to rank careers and explain why.
import { careers } from "../data/careers";

const TRAITS = ["analytical", "technical", "communication", "leadership", "creative"];
export const TRAIT_LABEL = { analytical: "Analytical", technical: "Technical", communication: "Communication", leadership: "Leadership", creative: "Creative" };
const TRAIT_TIP = {
  analytical: "Practice case studies and SQL/Excel puzzles weekly.",
  technical: "Ship one small project to turn curiosity into proof.",
  communication: "Write up a project as a 1-page story and present it.",
  leadership: "Lead a study group or volunteer to coordinate a project.",
  creative: "Redesign something you use daily and document your reasoning.",
};
export const traitPct = (score) => Math.max(0, Math.min(100, Math.round(((score + 2) / 4) * 100)));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");

export function buildInsights(result, profile = {}) {
  const pct = {};
  (result?.scores || []).forEach((s) => { pct[s.trait] = traitPct(s.score); });
  const userSkills = (profile.skills || []).map(norm);
  const ranked = careers.map((c) => {
    const keys = Object.keys(c.scores);
    const diff = keys.reduce((a, k) => a + Math.abs((pct[k] ?? 50) - c.scores[k]), 0) / keys.length;
    const traitFit = Math.max(0, 100 - diff);
    const have = c.skills.filter((s) => userSkills.some((u) => u && (norm(s).includes(u) || u.includes(norm(s)))));
    const missing = c.skills.filter((s) => !have.includes(s));
    const skillFit = (have.length / c.skills.length) * 100;
    const bonus = profile.targetRole && c.title.toLowerCase().includes(profile.targetRole.toLowerCase().split(" ")[0]) ? 6 : 0;
    const match = Math.min(98, Math.round(traitFit * 0.75 + skillFit * 0.25 + bonus));
    const bestTrait = keys.reduce((a, k) => (Math.min(pct[k] ?? 0, c.scores[k]) > Math.min(pct[a] ?? 0, c.scores[a]) ? k : a), keys[0]);
    return { ...c, match, have, missing, why: `Your ${TRAIT_LABEL[bestTrait].toLowerCase()} score (${pct[bestTrait] ?? 0}%) fits this role${have.length ? ` and you already know ${have.slice(0, 2).join(" & ")}` : ""}.` };
  }).sort((a, b) => b.match - a.match);
  const sorted = TRAITS.filter((t) => t in pct).sort((a, b) => pct[b] - pct[a]);
  const weakest = sorted[sorted.length - 1];
  return {
    pct, ranked, top: sorted.slice(0, 2), weakest, tip: weakest ? TRAIT_TIP[weakest] : "",
    persona: sorted.length > 1 ? `${TRAIT_LABEL[sorted[0]]} ${TRAIT_LABEL[sorted[1]]}` : "Explorer",
  };
}

export function profileInsights(profile = {}) {
  const skills = profile.skills || [];
  const strength = [skills.length >= 5, !!profile.about, !!profile.targetRole, (profile.interests || []).length >= 2, !!profile.goal].filter(Boolean).length;
  const tips = [];
  if (skills.length < 5) tips.push("Add at least 5 skills — matches sharpen with each one.");
  if (!profile.about) tips.push("Write a short 'About you' with a project or achievement.");
  if (!profile.targetRole) tips.push("Set a target role so roadmaps can aim at it.");
  if ((profile.interests || []).length < 2) tips.push("Pick two or more interests to widen your matches.");
  const base = { skills, assessmentless: true };
  const best = careers.map((c) => {
    const have = c.skills.filter((s) => skills.some((u) => norm(s).includes(norm(u)) || norm(u).includes(norm(s))));
    return { ...c, have, fit: Math.round((have.length / c.skills.length) * 100) };
  }).sort((a, b) => b.fit - a.fit)[0];
  return { strength: Math.round((strength / 5) * 100), tips: tips.slice(0, 3), best, base };
}
