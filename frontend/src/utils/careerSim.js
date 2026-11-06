// What-if readiness maths for the Compare Careers simulator. Pure functions, no network.
export const TRAITS = [
  { key: "analytical", label: "Analytical" },
  { key: "technical", label: "Technical" },
  { key: "communication", label: "Communication" },
  { key: "leadership", label: "Leadership" },
];
const SKILL_TARGETS = [85, 80, 75, 70, 65, 60];
const SKILL_WEIGHTS = [1.5, 1.3, 1.1, 1, 1, 0.9];

/** Items a career asks for: its listed skills (earlier = more core) and its four trait scores. */
export function requirements(career) {
  const skills = (career.skills || []).map((name, i) => ({ id: `skill:${name}`, kind: "skill", name, target: SKILL_TARGETS[Math.min(i, 5)], weight: SKILL_WEIGHTS[Math.min(i, 5)] * 1.3 }));
  const traits = TRAITS.filter((t) => career.scores?.[t.key] != null).map((t) => ({ id: `trait:${t.key}`, kind: "trait", name: t.label, target: career.scores[t.key], weight: 0.8 }));
  return [...skills, ...traits];
}

export function score(career, levels) {
  const reqs = requirements(career);
  const total = reqs.reduce((a, r) => a + r.weight, 0) || 1;
  const got = reqs.reduce((a, r) => a + r.weight * Math.min(1, (levels[r.id] ?? 0) / Math.max(r.target, 1)), 0);
  return Math.round((got / total) * 100);
}

export function gaps(career, levels) {
  const reqs = requirements(career);
  const total = reqs.reduce((a, r) => a + r.weight, 0) || 1;
  return reqs.map((r) => {
    const have = levels[r.id] ?? 0;
    const gap = Math.max(0, r.target - have);
    return { ...r, have, gap, gain: Math.round((r.weight * (gap / r.target)) / total * 100), weeks: Math.max(1, Math.ceil(gap / 6)), met: gap === 0 };
  }).sort((a, b) => b.gain - a.gain);
}

/** Smallest set of the biggest gaps that, once closed, lifts the score to `goal`. */
export function plan(career, levels, goal = 80) {
  const current = score(career, levels);
  const list = gaps(career, levels).filter((g) => !g.met);
  const steps = [];
  let running = { ...levels };
  for (const g of list) {
    if (score(career, running) >= goal) break;
    running = { ...running, [g.id]: g.target };
    steps.push({ ...g, scoreAfter: score(career, running) });
  }
  return { current, steps, reachable: score(career, running) >= goal, levels: running };
}

export const verdict = (s) => (s >= 85 ? "Ready to apply" : s >= 70 ? "Close. A few targeted gaps" : s >= 50 ? "Building. Solid foundation to grow" : "Early stage. Start with the biggest gaps");
