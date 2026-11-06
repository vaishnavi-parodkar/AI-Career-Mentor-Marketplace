// Profile completeness helpers, shared by the profile page, login redirect and Home banner.
// The backend stores whatever has been filled in so far; "complete" is decided here.

export const PROFILE_SECTIONS = [
  { id: "education", label: "Education", step: 0, done: (p) => !!(p.qualification && p.field?.trim() && p.gradYear) },
  { id: "skills", label: "Skills & experience", step: 1, done: (p) => !!(p.skills?.length && p.currentStatus && p.experienceLevel) },
  { id: "interests", label: "Interests", step: 2, done: (p) => !!p.interests?.length },
  { id: "goals", label: "Goals", step: 3, done: (p) => !!p.goal },
];

// Account details (name + email) always count, so a brand-new user starts at ~20%, not 0%.
const ACCOUNT_WEIGHT = 20;

export const getProfileCompletion = (profile) => {
  const p = profile || {};
  const sections = PROFILE_SECTIONS.map((s) => ({ ...s, complete: s.done(p) }));
  const doneCount = sections.filter((s) => s.complete).length;
  const percent = Math.round(ACCOUNT_WEIGHT + (doneCount / sections.length) * (100 - ACCOUNT_WEIGHT));
  const nextStep = sections.find((s) => !s.complete);
  return { sections, percent, isComplete: doneCount === sections.length, nextStep: nextStep ? nextStep.step : null };
};
