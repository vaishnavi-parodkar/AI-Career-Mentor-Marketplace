import { computeGapProgress } from "./gapProgress";

/*
 * Badges are derived from data the app already stores (profile, roadmaps,
 * mock interview history), so nothing extra needs saving and they can never
 * get out of sync: undo a roadmap step and the badge that depended on it goes
 * away again.
 */

const stepStats = (roadmaps) => {
  const total = roadmaps.reduce((sum, r) => sum + (r.steps?.length || 0), 0);
  const done = roadmaps.reduce(
    (sum, r) => sum + (r.steps?.filter((s) => s.completed).length || 0),
    0
  );
  return { total, done };
};

export function computeBadges({ completion, roadmaps = [], interviews = [], profile = {} }) {
  const withSteps = roadmaps.filter((r) => r.steps?.length > 0);
  const { total, done } = stepStats(withSteps);

  const bestRatio = withSteps.reduce(
    (best, r) =>
      Math.max(best, r.steps.filter((s) => s.completed).length / r.steps.length),
    0
  );
  const finished = withSteps.some((r) => r.steps.every((s) => s.completed));
  const gapClosed = withSteps.some((r) => {
    const progress = computeGapProgress(r);
    return progress && progress.totalGap > 0 && progress.percentClosed === 100;
  });
  const bestInterview = interviews.reduce((best, i) => Math.max(best, Number(i.overall) || 0), 0);

  return [
    {
      id: "profile-pioneer",
      icon: "profile",
      title: "Profile Pioneer",
      description: "Completed 100% of your profile.",
      hint: `Finish every profile section (${completion.percent}% so far).`,
      earned: completion.isComplete,
    },
    {
      id: "pathfinder",
      icon: "map",
      title: "Pathfinder",
      description: "Generated your personalised career roadmap.",
      hint: "Run a skill gap analysis and generate a roadmap.",
      earned: withSteps.length > 0,
    },
    {
      id: "first-step",
      icon: "steps",
      title: "First Step",
      description: "Completed your first roadmap step.",
      hint: "Tick off any step on your roadmap.",
      earned: done >= 1,
    },
    {
      id: "halfway",
      icon: "flag",
      title: "Halfway There",
      description: "Completed half of a roadmap.",
      hint: total ? `${done} of ${total} steps done — reach 50% of one roadmap.` : "Generate a roadmap first.",
      earned: bestRatio >= 0.5,
    },
    {
      id: "gap-closer",
      icon: "target",
      title: "Gap Closer",
      description: "Closed every skill gap from your analysis.",
      hint: "Complete the steps that target each skill gap.",
      earned: gapClosed,
    },
    {
      id: "roadmap-finisher",
      icon: "trophy",
      title: "Roadmap Finisher",
      description: "Completed every step of a roadmap.",
      hint: total ? `${done} of ${total} steps done.` : "Generate a roadmap first.",
      earned: finished,
    },
    {
      id: "interview-ready",
      icon: "mic",
      title: "Interview Ready",
      description: "Finished a mock interview.",
      hint: "Take a mock interview from the practice section.",
      earned: interviews.length > 0,
    },
    {
      id: "interview-ace",
      icon: "award",
      title: "Interview Ace",
      description: "Scored 80% or higher in a mock interview.",
      hint: bestInterview ? `Your best is ${bestInterview}%.` : "Take a mock interview and aim for 80%+.",
      earned: bestInterview >= 80,
    },
    { id: "skill-collector", icon: "sparkles", title: "Skill Collector", description: "Listed 5 or more skills.", hint: `Add skills to your profile (${profile.skills?.length || 0}/5).`, earned: (profile.skills?.length || 0) >= 5 },
    { id: "storyteller", icon: "pen", title: "Storyteller", description: "Wrote your About section.", hint: "Add a short About you to your profile.", earned: !!profile.about?.trim() },
    { id: "goal-setter", icon: "compass", title: "Goal Setter", description: "Set a target role.", hint: "Add a target role to your profile.", earned: !!profile.targetRole?.trim() },
    { id: "explorer", icon: "compass", title: "Explorer", description: "Picked 3 or more interest areas.", hint: `Select interests (${profile.interests?.length || 0}/3).`, earned: (profile.interests?.length || 0) >= 3 },
    { id: "momentum", icon: "steps", title: "Momentum", description: "Completed 5 roadmap steps.", hint: `${done} of 5 steps done.`, earned: done >= 5 },
    { id: "double-digits", icon: "flag", title: "Double Digits", description: "Completed 10 roadmap steps.", hint: `${done} of 10 steps done.`, earned: done >= 10 },
    { id: "multi-track", icon: "layers", title: "Multi-Track", description: "Created 2 or more roadmaps.", hint: "Generate roadmaps for two careers.", earned: withSteps.length >= 2 },
    { id: "practice-regular", icon: "mic", title: "Practice Regular", description: "Finished 3 mock interviews.", hint: `${interviews.length} of 3 mock interviews done.`, earned: interviews.length >= 3 },
  ];
}
