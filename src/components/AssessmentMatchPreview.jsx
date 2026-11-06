import { CheckCircle2, ClipboardCheck } from "lucide-react";
import MatchRing from "./MatchRing";
import { landingContent } from "../data/landingContent";

export default function AssessmentMatchPreview({ compact = false, className = "" }) {
  const { preview } = landingContent;

  return (
    <section
      className={`border border-border bg-off-white p-5 text-text-dark shadow-soft sm:p-7 ${className}`}
      aria-label="Illustrative assessment to career match preview"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="type-meta text-coral">{preview.label}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-light-sage px-3 py-1.5 text-xs font-semibold text-dark-green">
          <ClipboardCheck size={14} aria-hidden="true" /> {preview.assessment}
        </span>
      </div>

      <div className={`grid gap-6 pt-5 ${compact ? "sm:grid-cols-[1fr_auto]" : "sm:grid-cols-[1fr_auto]"}`}>
        <div className="min-w-0">
          <p className="type-meta">Trait signal</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {preview.traits.map((trait) => (
              <span key={trait} className="rounded-full bg-light-sage px-3 py-1.5 text-xs font-semibold text-dark-green">
                {trait}
              </span>
            ))}
          </div>
          <div className="mt-6 border-t border-border pt-5">
            <p className="type-meta">Sample career match</p>
            <h3 className="mt-1 font-heading text-2xl font-bold text-dark-green">{preview.career}</h3>
            <p className="mt-2 type-supporting">{preview.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:justify-start sm:gap-2">
          <MatchRing value={preview.match} size={compact ? 82 : 96} strokeWidth={compact ? 7 : 8} valueClassName={compact ? "text-lg" : "text-xl"} />
          <span className="type-meta text-text-muted">Illustrative fit</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
        {preview.reasons.map((reason) => (
          <p key={reason} className="flex items-start gap-2 text-sm leading-6 text-text-dark">
            <CheckCircle2 size={16} className="mt-1 shrink-0 text-green" aria-hidden="true" />
            {reason}
          </p>
        ))}
      </div>
    </section>
  );
}
