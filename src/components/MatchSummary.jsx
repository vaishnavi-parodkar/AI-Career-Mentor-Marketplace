import MatchRing from "./MatchRing";

export default function MatchSummary({ value }) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return null;

  return (
    <div className="mt-8 border-y border-border py-6">
      <p className="type-eyebrow">Your assessment signal</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <MatchRing value={numericValue} size={96} strokeWidth={8} valueClassName="text-xl sm:text-2xl" />
        <div className="min-w-0">
          <p className="font-heading text-2xl font-bold leading-tight text-dark-green sm:text-3xl">Career Match</p>
          <p className="mt-1 text-sm font-semibold text-dark-green">Based on your assessment</p>
          <p className="mt-3 max-w-md type-supporting">Pathwise recommended this path because it aligns with the patterns you surfaced in your assessment.</p>
        </div>
      </div>
    </div>
  );
}
