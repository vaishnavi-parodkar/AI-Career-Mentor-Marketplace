/*
 * Gap progress helpers.
 *
 * A roadmap is generated from a skill-gap analysis. The backend stores that
 * analysis as `roadmap.gapSnapshot` (JSON string) and gives every step the
 * skill it works on (`skillName`) plus how many gap points it closes
 * (`gapReduction`). Completing a step moves that skill closer to its
 * required level.
 */

const norm = (value) => String(value ?? "").trim().toLowerCase();

export function parseGapSnapshot(roadmap) {
  if (!roadmap?.gapSnapshot) return null;

  try {
    const snapshot = JSON.parse(roadmap.gapSnapshot);
    return Array.isArray(snapshot?.skills) ? snapshot : null;
  } catch {
    return null;
  }
}

/**
 * Returns null for roadmaps created before gap tracking existed.
 */
export function computeGapProgress(roadmap) {
  const snapshot = parseGapSnapshot(roadmap);
  if (!snapshot) return null;

  const steps = Array.isArray(roadmap.steps) ? roadmap.steps : [];

  const skills = snapshot.skills.map((skill) => {
    const key = norm(skill.skillName);
    const skillSteps = steps.filter((step) => norm(step.skillName) === key);

    const baseline = Number(skill.currentLevel) || 0;
    const required = Number(skill.requiredLevel) || 0;
    const baseGap = Math.max(0, required - baseline);

    const closed = skillSteps
      .filter((step) => step.completed)
      .reduce((sum, step) => sum + (Number(step.gapReduction) || 0), 0);

    const planned = skillSteps.reduce(
      (sum, step) => sum + (Number(step.gapReduction) || 0),
      0
    );

    const closedCapped = Math.min(closed, baseGap);

    return {
      name: skill.skillName,
      baseline,
      required,
      baseGap,
      closed: closedCapped,
      current: baseline + closedCapped,
      remaining: baseGap - closedCapped,
      // part of the gap no roadmap step works on
      uncovered: Math.max(0, baseGap - planned),
      stepCount: skillSteps.length,
      doneCount: skillSteps.filter((step) => step.completed).length,
    };
  });

  const totalGap = skills.reduce((sum, skill) => sum + skill.baseGap, 0);
  const closedGap = skills.reduce((sum, skill) => sum + skill.closed, 0);

  return {
    skills,
    totalGap,
    closedGap,
    remainingGap: totalGap - closedGap,
    percentClosed: totalGap > 0 ? Math.round((closedGap / totalGap) * 100) : 100,
  };
}

/** Looks up the progress entry a given step contributes to. */
export function skillProgressForStep(progress, step) {
  if (!progress || !step?.skillName) return null;
  return progress.skills.find((skill) => norm(skill.name) === norm(step.skillName)) || null;
}

/** Latest roadmap (highest id) for a career from a /roadmaps/user/{id} list. */
export function pickLatestRoadmap(roadmaps, careerId) {
  const list = Array.isArray(roadmaps) ? roadmaps : [];
  const matching = careerId
    ? list.filter((item) => item.career?.careerId === careerId)
    : list;

  return matching.reduce(
    (latest, current) => (!latest || current.id > latest.id ? current : latest),
    null
  );
}
