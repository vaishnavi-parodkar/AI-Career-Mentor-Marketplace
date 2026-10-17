import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { jobsApi } from "../services/platformApi";

const REFRESH_MS = 5 * 60 * 1000;

/** Live skill demand counted from current job listings; refreshes automatically and on demand. */
export default function LiveMarket({ careerId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback((reset = false) => {
    if (reset) setData(null);
    setError("");
    setLoading(true);
    jobsApi.insights(careerId).then((d) => { setData(d); setUpdated(new Date()); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [careerId]);

  useEffect(() => { load(true); const id = setInterval(() => load(false), REFRESH_MS); return () => clearInterval(id); }, [load]);

  const skills = data?.topSkills || [];
  const top = Math.max(1, ...skills.map((s) => s.jobs));
  const list = showAll ? skills : skills.slice(0, 6);

  return (
    <section className="border-b border-border py-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="type-section-title">Live demand from current job listings</h2>
        <button type="button" onClick={() => load(false)} disabled={loading} className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-dark-green hover:bg-light-sage disabled:opacity-60">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} aria-hidden="true" />{loading ? "Updating" : "Refresh"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-coral">{error}</p>}
      {!data && !error && <p className="mt-3 text-sm text-text-muted">Counting skills in current listings...</p>}
      {data && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[[data.sampleSize, "Listings sampled"], [`${data.remoteShare}%`, "Remote"], [`${data.fresherShare}%`, "Entry-level"]].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-light-sage/60 p-3"><p className="font-heading text-2xl font-bold text-dark-green">{v}</p><p className="type-meta">{l}</p></div>
            ))}
          </div>
          <div className="mt-5 space-y-2.5">
            {list.map((s) => (
              <div key={s.skill} className="flex items-center gap-3 text-sm" title={`${s.skill}: ${s.jobs} listings (${s.share}% of sample)`}>
                <span className="w-28 shrink-0 truncate font-semibold text-text-dark sm:w-36">{s.skill}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-light-sage"><div className="h-full rounded-full bg-dark-green transition-[width] duration-700" style={{ width: `${(s.jobs / top) * 100}%` }} /></div>
                <span className="w-20 shrink-0 text-right text-text-muted">{s.jobs} <span className="hidden sm:inline">listings</span> · {s.share}%</span>
              </div>
            ))}
            {skills.length === 0 && <p className="text-sm text-text-muted">No listings available right now.</p>}
          </div>
          {skills.length > 6 && <button type="button" onClick={() => setShowAll((v) => !v)} className="focus-ring mt-3 text-sm font-semibold text-dark-green hover:underline">{showAll ? "Show fewer skills" : `Show all ${skills.length} skills`}</button>}
          {data.career && (
            <div className="mt-5 text-sm text-text-dark">
              <p><strong>{data.career.title}:</strong> {data.career.salaryRange} · demand {data.career.demand} · top location {data.career.topLocation}</p>
              {data.career.requiredSkillsSeenInListings?.length > 0 && <p className="mt-1">Required skills seen in listings: {data.career.requiredSkillsSeenInListings.join(", ")}</p>}
            </div>
          )}
          <p className="mt-4 text-xs text-text-muted">{updated && `Updated ${updated.toLocaleTimeString()} · refreshes every 5 minutes. `}{data.note}</p>
        </>
      )}
    </section>
  );
}
