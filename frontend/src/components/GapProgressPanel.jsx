import { TrendingUp } from "lucide-react";

/*
 * Per-skill view of the gap: solid = level at the time the roadmap was made,
 * light green = gained by completed roadmap steps, hatched = gap still open.
 * The tick marks the level the career requires.
 */
function SkillRow({ skill }) {
  const { baseline, closed, required, current, remaining, name } = skill;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-[#162c29]">{name}</span>

        <span className="text-xs text-text-muted">
          <span className="font-bold text-dark-green">{current}%</span>
          {" / "}
          {required}% required
          {remaining > 0 ? (
            <span className="ml-2 font-semibold text-[#d96f58]">
              gap {remaining}%
            </span>
          ) : (
            <span className="ml-2 font-semibold text-dark-green">gap closed</span>
          )}
        </span>
      </div>

      <div className="relative h-2.5 overflow-hidden rounded-full bg-[#e6e1d3]">
        <div
          className="absolute inset-y-0 left-0 bg-dark-green"
          style={{ width: `${baseline}%` }}
        />
        <div
          className="absolute inset-y-0 bg-[#7fb77e] transition-all duration-500"
          style={{ left: `${baseline}%`, width: `${closed}%` }}
        />
        <div
          className="absolute inset-y-0 bg-[#f2cabb] transition-all duration-500"
          style={{ left: `${current}%`, width: `${remaining}%` }}
        />
      </div>

      <div className="relative h-0">
        <div
          className="absolute -top-3 h-3.5 w-0.5 bg-[#162c29]"
          style={{ left: `calc(${required}% - 1px)` }}
          title={`Required: ${required}%`}
        />
      </div>

      <p className="mt-1.5 text-[11px] text-text-muted">
        {skill.stepCount > 0
          ? `${skill.doneCount} of ${skill.stepCount} roadmap steps done` +
            (closed > 0 ? ` · +${closed}% gained` : "")
          : "No roadmap step targets this skill yet"}
      </p>
    </div>
  );
}

export default function GapProgressPanel({ progress, title = "Skill gap progress" }) {
  if (!progress) return null;

  // Skills that never had a gap are noise here.
  const rows = progress.skills.filter((skill) => skill.baseGap > 0);

  return (
    <section className="rounded-[20px] border border-[#e5dfd0] bg-[#fffdf8] p-4 shadow-[0_3px_12px_rgba(50,70,50,0.07)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-dark-green" />
          <h2 className="font-heading text-lg font-bold text-dark-green">{title}</h2>
        </div>

        <div className="rounded-xl bg-[#e8f1df] px-4 py-2 text-center">
          <p className="text-[11px] font-medium text-text-muted">Gap closed</p>
          <p className="text-2xl font-bold text-dark-green">
            {progress.percentClosed}%
          </p>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#e6e1d3]">
        <div
          className="h-full bg-dark-green transition-all duration-500"
          style={{ width: `${progress.percentClosed}%` }}
        />
      </div>

      <p className="mb-5 text-xs text-text-muted">
        {progress.remainingGap > 0
          ? `${progress.closedGap} of ${progress.totalGap} gap points closed — ${progress.remainingGap} to go. Each completed roadmap step moves a skill closer to its required level.`
          : "Every gap from your analysis is closed. Re-run the analysis to confirm and set new targets."}
      </p>

      <div className="space-y-6">
        {rows.map((skill) => (
          <SkillRow key={skill.name} skill={skill} />
        ))}
      </div>
    </section>
  );
}
