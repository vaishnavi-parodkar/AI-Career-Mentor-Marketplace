import { useEffect, useMemo, useState } from "react";
import { GitCompare, RotateCcw, Wand2, Check, TrendingUp, Clock } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import MatchRing from "../components/MatchRing";
import { careerApi, profileApi } from "../services/api";
import { useAssessment } from "../context/AssessmentContext";
import { requirements, score, gaps, plan, verdict } from "../utils/careerSim";

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");

export default function CompareCareers() {
  const { compareIds, toggleCompare } = useAssessment();
  const [careers, setCareers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [levels, setLevels] = useState({});
  const [touched, setTouched] = useState(false);
  const [goal, setGoal] = useState(80);

  useEffect(() => {
    careerApi.getAll().then((c) => setCareers(Array.isArray(c) ? c : []));
    profileApi.getProfile().then((r) => { if (r?.success) setProfile(r.profile); }).catch(() => {});
  }, []);

  const selected = careers.filter((c) => compareIds.includes(c.id));
  const items = useMemo(() => {
    const map = new Map();
    selected.forEach((c) => requirements(c).forEach((r) => { if (!map.has(r.id)) map.set(r.id, r); }));
    return [...map.values()];
  }, [selected]);

  // Starting point: skills in your profile start at 60, everything else at 20. Sliders are yours to change.
  const startFor = (item) => {
    if (item.kind === "trait") return 50;
    const have = (profile?.skills || []).map(norm);
    return have.some((h) => h && (norm(item.name).includes(h) || h.includes(norm(item.name)))) ? 60 : 20;
  };
  const baseline = useMemo(() => Object.fromEntries(items.map((i) => [i.id, startFor(i)])), [items, profile]); // eslint-disable-line react-hooks/exhaustive-deps
  const value = (id) => levels[id] ?? baseline[id] ?? 0;
  const effective = useMemo(() => Object.fromEntries(items.map((i) => [i.id, value(i.id)])), [items, levels, baseline]); // eslint-disable-line react-hooks/exhaustive-deps
  const setLevel = (id, v) => { setTouched(true); setLevels((l) => ({ ...l, [id]: v })); };

  const results = selected.map((c) => {
    const s = score(c, effective), base = score(c, baseline);
    return { career: c, s, base, gaps: gaps(c, effective), plan: plan(c, effective, goal) };
  });
  const best = results.length ? results.reduce((a, b) => (b.s > a.s ? b : a)) : null;

  const applyPlan = (r) => { setTouched(true); setLevels((l) => ({ ...l, ...Object.fromEntries(Object.entries(r.plan.levels).filter(([k]) => k in effective)) })); };

  return (
    <Layout>
      <div className="mb-6"><p className="type-eyebrow">Decision support</p><h1 className="mt-2 type-page-title">Compare careers</h1><p className="mt-3 max-w-2xl type-body">Pick two or three paths, then move your skill levels. The result updates live so you can see which changes get you closest to each career.</p></div>

      <div className="mb-7 flex flex-wrap gap-2" role="group" aria-label="Choose careers to compare">
        {careers.map((c) => {
          const on = compareIds.includes(c.id);
          return <button key={c.id} type="button" onClick={() => toggleCompare(c.id)} aria-pressed={on} disabled={!on && compareIds.length >= 3} className={`focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors disabled:opacity-40 ${on ? "border-dark-green bg-dark-green text-off-white" : "border-border bg-off-white text-text-dark hover:bg-light-sage"}`}>{on && <Check size={14} aria-hidden="true" />}{c.title}</button>;
        })}
      </div>

      {selected.length < 2 ? <EmptyState icon={GitCompare} title="Select at least two careers" description="Choose up to three careers above to open the what-if simulator." /> : (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* LEFT: levers */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card elevated className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-xl font-bold text-dark-green">Your skill levels</h2>
                <button type="button" onClick={() => { setLevels({}); setTouched(false); }} className="focus-ring inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-text-muted hover:bg-light-sage"><RotateCcw size={12} aria-hidden="true" />Reset</button>
              </div>
              <p className="mt-1 text-xs text-text-muted">Drag to set how strong you are (or could become). Skills from your profile start at 60.</p>
              {[["skill", "Skills"], ["trait", "Core traits"]].map(([kind, label]) => (
                <div key={kind} className="mt-5">
                  <p className="type-meta mb-2">{label}</p>
                  <div className="space-y-4">
                    {items.filter((i) => i.kind === kind).map((i) => (
                      <div key={i.id}>
                        <div className="mb-1 flex items-center justify-between text-sm"><label htmlFor={i.id} className="font-semibold text-text-dark">{i.name}</label><span className="font-bold tabular-nums text-dark-green">{value(i.id)}%</span></div>
                        <input id={i.id} type="range" min="0" max="100" step="5" value={value(i.id)} onChange={(e) => setLevel(i.id, Number(e.target.value))} className="h-2 w-full cursor-pointer accent-[#064C3B]" aria-valuetext={`${value(i.id)} percent`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-5 border-t border-border pt-4">
                <label htmlFor="goal" className="flex justify-between text-sm font-semibold text-text-dark"><span>Target readiness</span><span className="text-dark-green">{goal}%</span></label>
                <input id="goal" type="range" min="50" max="100" step="5" value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer accent-[#064C3B]" />
              </div>
            </Card>
          </aside>

          {/* RIGHT: results */}
          <section className="min-w-0 space-y-5" aria-live="polite">
            {best && (
              <Card className="border-sage bg-light-sage/50">
                <p className="type-meta">Closest right now</p>
                <p className="mt-1 font-heading text-2xl font-bold text-dark-green">{best.career.title} <span className="text-lg text-text-muted">at {best.s}%</span></p>
                <p className="mt-1 text-sm leading-6 text-text-dark">{results.length > 1 && results.filter((r) => r !== best).map((r) => `${best.s - r.s >= 0 ? best.s - r.s : 0} points ahead of ${r.career.title}`).join(", ")}{touched && ` · your changes moved ${best.career.title} by ${best.s - best.base >= 0 ? "+" : ""}${best.s - best.base} from where you started.`}</p>
              </Card>
            )}

            {results.map(({ career, s, base, gaps: g, plan: pl }) => {
              const open = g.filter((x) => !x.met);
              return (
                <Card key={career.id} elevated className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <MatchRing value={s} size={96} strokeWidth={8} valueClassName="text-xl" label="readiness for this career" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-2xl font-bold text-dark-green">{career.title}</h3>
                      <p className="text-sm font-semibold text-text-dark">{verdict(s)}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                        {career.salaryRange && <span>{career.salaryRange}</span>}{career.market?.demand && <span className="inline-flex items-center gap-1"><TrendingUp size={12} aria-hidden="true" />{career.market.demand} demand</span>}
                        {touched && s !== base && <span className={`font-bold ${s > base ? "text-green" : "text-coral"}`}>{s > base ? "+" : ""}{s - base} vs start</span>}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div>
                      <p className="type-meta mb-2">Where you stand</p>
                      <ul className="space-y-2.5">
                        {g.slice().sort((a, b) => a.name.localeCompare(b.name)).map((x) => (
                          <li key={x.id}>
                            <div className="mb-1 flex justify-between text-xs font-semibold text-text-dark"><span>{x.name}</span><span className={x.met ? "text-green" : "text-text-muted"}>{x.have}% / {x.target}% needed</span></div>
                            <div className="relative h-2 rounded-full bg-light-sage"><div className={`h-2 rounded-full transition-[width] duration-300 ${x.met ? "bg-green" : "bg-sage"}`} style={{ width: `${Math.min(100, x.have)}%` }} /><span className="absolute top-[-2px] h-3 w-0.5 bg-dark-green" style={{ left: `${x.target}%` }} aria-hidden="true" /></div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="type-meta mb-2">Fastest way to {goal}%</p>
                      {s >= goal ? <p className="rounded-lg bg-light-sage/60 p-3 text-sm text-text-dark">You are already at or above {goal}%. Keep your strongest skills sharp and start applying.</p> : (
                        <>
                          <ol className="space-y-2">
                            {pl.steps.map((st, i) => (
                              <li key={st.id} className="flex items-start gap-2.5 rounded-lg border border-border bg-cream p-2.5 text-sm">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dark-green text-xs font-bold text-off-white">{i + 1}</span>
                                <span className="min-w-0"><span className="font-semibold text-dark-green">Raise {st.name} {st.have}% → {st.target}%</span><br /><span className="text-xs text-text-muted">Score becomes {st.scoreAfter}% · about {st.weeks} week{st.weeks > 1 ? "s" : ""} of steady practice <Clock size={10} className="inline" aria-hidden="true" /></span></span>
                              </li>
                            ))}
                          </ol>
                          {!pl.reachable && <p className="mt-2 text-xs text-text-muted">Even with every gap closed the score tops out at {score(career, pl.levels)}%. Try a lower target.</p>}
                          <Button size="sm" variant="outline" icon={Wand2} className="mt-3" onClick={() => applyPlan({ plan: pl })}>Apply this plan to the sliders</Button>
                        </>
                      )}
                    </div>
                  </div>

                  <details className="mt-5 rounded-xl border border-border bg-cream p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-dark-green">About this career</summary>
                    <div className="mt-3 grid gap-4 text-sm leading-6 text-text-dark sm:grid-cols-2">
                      <div><p className="type-meta">Day to day</p><ul className="mt-1 list-disc pl-4">{(career.responsibilities || []).slice(0, 4).map((r) => <li key={r}>{r}</li>)}</ul></div>
                      <div><p className="type-meta">Growth path</p><p className="mt-1">{career.growth}</p>{open.length > 0 && <><p className="type-meta mt-3">Skills still below target</p><p className="mt-1">{open.filter((x) => x.kind === "skill").map((x) => x.name).join(", ") || "None"}</p></>}</div>
                    </div>
                  </details>
                </Card>
              );
            })}
          </section>
        </div>
      )}
    </Layout>
  );
}
