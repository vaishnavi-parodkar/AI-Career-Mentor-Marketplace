import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Wrench, Play, RotateCcw, BookOpen, Sun, Bell, Zap, Target, Users, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import MatchRing from "../components/MatchRing";
import { careerApi } from "../services/api";
import { dayInLife, dayTypeMeta } from "../data/dayInLife";
import { buildScenes, METERS, START_METERS, LEAN_META } from "../data/dayScenes";

const clamp = (n) => Math.max(0, Math.min(100, n));

const toMinutes = (t) => {
  const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(t || "");
  if (!m) return 9 * 60;
  return ((Number(m[1]) % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + Number(m[2]);
};

const formatClock = (minutes) => {
  const total = Math.round(minutes);
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h24 % 12 || 12}:${String(m).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
};

const METER_ICON = { energy: Zap, results: Target, trust: Users };
const METER_COLOR = { energy: "bg-sage", results: "bg-green", trust: "bg-coral" };

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Smoothly counts the clock from its old time to the new one.
function useAnimatedMinutes(target) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    if (prefersReducedMotion()) { fromRef.current = target; setValue(target); return undefined; }
    const from = fromRef.current;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = from + (target - from) * eased;
      fromRef.current = next;
      setValue(next);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

function MeterBar({ meter, value, delta }) {
  const Icon = METER_ICON[meter.key];
  return (
    <div className="relative min-w-0" title={meter.hint}>
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text-muted">
        <span className="flex items-center gap-1.5"><Icon size={13} aria-hidden="true" />{meter.label}</span>
        <span className="tabular-nums text-text-dark">{Math.round(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-light-sage" role="progressbar" aria-label={meter.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
        <div className={`h-full rounded-full ${METER_COLOR[meter.key]} transition-all duration-700 ease-out`} style={{ width: `${value}%` }} />
      </div>
      {delta ? (
        <span key={delta.id} className={`anim-delta pointer-events-none absolute -top-1 right-0 text-xs font-bold ${delta.value > 0 ? "text-green" : "text-coral"}`}>
          {delta.value > 0 ? "+" : ""}{delta.value}
        </span>
      ) : null}
    </div>
  );
}

function DeltaChips({ fx }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {METERS.map((m) => {
        const v = fx[m.key];
        if (!v) return null;
        return (
          <span key={m.key} className={`rounded-full px-2.5 py-1 text-xs font-bold ${v > 0 ? "bg-light-sage text-dark-green" : "bg-coral/15 text-coral"}`}>
            {m.label} {v > 0 ? "+" : ""}{v}
          </span>
        );
      })}
    </div>
  );
}

function Timeline({ day, activeIndex, setActiveIndex }) {
  const current = day.schedule[activeIndex];
  const currentMeta = dayTypeMeta[current.type];
  return (
    <section className="grid gap-10 border-b border-border py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <ol className="space-y-0" aria-label="Daily schedule">
        {day.schedule.map((item, index) => {
          const meta = dayTypeMeta[item.type];
          const isActive = index === activeIndex;
          return (
            <li key={item.time} className="relative flex gap-4 pb-6 last:pb-0">
              {index < day.schedule.length - 1 && <div className="absolute left-[5.4rem] top-5 h-[calc(100%-0.5rem)] w-px bg-border" />}
              <p className="w-20 shrink-0 pt-1 text-right text-sm font-semibold text-text-muted">{item.time}</p>
              <span className={`relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full ${meta.dot} ${isActive ? "ring-4 ring-light-sage" : ""}`} />
              <button type="button" onClick={() => setActiveIndex(index)} aria-pressed={isActive}
                className={`focus-ring flex-1 rounded-lg border px-4 py-3 text-left transition-colors ${isActive ? "border-sage bg-light-sage/60" : "border-transparent hover:bg-light-sage/30"}`}>
                <h3 className="text-base font-bold text-dark-green">{item.title}</h3>
                <p className="mt-0.5 type-meta">{meta.label}</p>
              </button>
            </li>
          );
        })}
      </ol>
      <aside className="h-fit border border-border bg-off-white p-6 lg:sticky lg:top-6">
        <p className="type-eyebrow">{current.time}</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-dark-green">{current.title}</h2>
        <p className="mt-1 flex items-center gap-2 type-meta"><span className={`h-2.5 w-2.5 rounded-full ${currentMeta.dot}`} />{currentMeta.label}</p>
        <p className="mt-4 type-supporting">{current.description}</p>
        {current.tools?.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="flex items-center gap-2 type-meta"><Wrench size={14} aria-hidden="true" />Tools you&apos;d use</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {current.tools.map((tool) => <span key={tool} className="rounded-full bg-light-sage px-3 py-1 text-sm font-medium text-dark-green">{tool}</span>)}
            </div>
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" size="sm" disabled={activeIndex === 0} onClick={() => setActiveIndex((i) => i - 1)}>Previous</Button>
          <Button size="sm" disabled={activeIndex === day.schedule.length - 1} onClick={() => setActiveIndex((i) => i + 1)}>Next</Button>
        </div>
      </aside>
    </section>
  );
}

function SplitBar({ label, split }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-text-dark">{label}</p>
      <div className="flex h-3 overflow-hidden rounded-full bg-light-sage" role="img"
        aria-label={`${label}: ${Object.entries(split).map(([k, v]) => `${dayTypeMeta[k].label} ${Math.round(v)}%`).join(", ")}`}>
        {Object.entries(split).map(([key, value]) => (
          <div key={key} className={`${dayTypeMeta[key].dot} transition-all duration-700`} style={{ width: `${value}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function DayInLife() {
  const { career: careerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const suffix = searchParams.get("mode") === "browse" ? "?mode=browse" : "";

  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("intro"); // intro | play | result | browse
  const [activeIndex, setActiveIndex] = useState(0); // used by the read-through timeline
  const [sceneIndex, setSceneIndex] = useState(0);
  const [picks, setPicks] = useState([]); // option index chosen per scene so far
  const [meters, setMeters] = useState(START_METERS);
  const [lastDeltas, setLastDeltas] = useState({});
  const sceneRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    careerApi.getDetailsById(careerId).then((res) => {
      if (!active) return;
      setCareer(res.success ? res.career : null);
      setLoading(false);
    });
    return () => { active = false; };
  }, [careerId]);

  const day = dayInLife[careerId];
  const scenes = useMemo(() => (day ? buildScenes(careerId, day.schedule) : null), [careerId, day]);

  const scene = scenes?.[sceneIndex];
  const chosenIndex = picks[sceneIndex]; // undefined until the person decides
  const answered = chosenIndex !== undefined;
  const clockTarget = scene ? toMinutes(scene.time) : 9 * 60;
  const clock = useAnimatedMinutes(clockTarget);

  const dayStart = scenes ? toMinutes(scenes[0].time) : 0;
  const dayEnd = scenes ? toMinutes(scenes[scenes.length - 1].time) : 1;
  const dayProgress = scenes ? clamp(((clock - dayStart) / Math.max(1, dayEnd - dayStart)) * 100) : 0;

  const choose = useCallback((optionIndex) => {
    if (!scene || answered || !scene.options[optionIndex]) return;
    const { fx } = scene.options[optionIndex];
    setPicks((prev) => { const next = [...prev]; next[sceneIndex] = optionIndex; return next; });
    setMeters((prev) => ({
      energy: clamp(prev.energy + fx.energy),
      results: clamp(prev.results + fx.results),
      trust: clamp(prev.trust + fx.trust),
    }));
    const stamp = Date.now();
    setLastDeltas(Object.fromEntries(METERS.map((m) => [m.key, fx[m.key] ? { id: `${stamp}-${m.key}`, value: fx[m.key] } : null])));
  }, [scene, answered, sceneIndex]);

  const next = useCallback(() => {
    if (!answered) return;
    setLastDeltas({});
    if (sceneIndex >= scenes.length - 1) { setPhase("result"); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSceneIndex((i) => i + 1);
    requestAnimationFrame(() => sceneRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" }));
  }, [answered, sceneIndex, scenes]);

  // Keyboard: 1-3 to choose, Enter to continue.
  useEffect(() => {
    if (phase !== "play") return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key >= "1" && e.key <= "9") choose(Number(e.key) - 1);
      else if (e.key === "Enter" && answered && document.activeElement?.tagName !== "BUTTON") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, choose, next, answered]);

  const startDay = () => {
    setPicks([]); setSceneIndex(0); setMeters(START_METERS); setLastDeltas({});
    setPhase("play");
    window.scrollTo({ top: 0 });
  };

  if (loading) return <Layout><Loader label="Loading a day in the life..." /></Layout>;

  if (!day) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl py-10">
          <BackButton to={`/careers/${careerId}${suffix}`} />
          <p className="mt-6 type-supporting text-text-dark">A day-in-the-life walkthrough isn&apos;t available for this career yet.</p>
        </div>
      </Layout>
    );
  }

  const title = career?.title || careerId;
  const canPlay = !!scenes;

  const splitBar = (
    <div className="mt-8 max-w-xl">
      <p className="type-meta">How the day is really spent</p>
      <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-light-sage" role="img"
        aria-label={Object.entries(day.split).map(([k, v]) => `${dayTypeMeta[k].label} ${v}%`).join(", ")}>
        {Object.entries(day.split).map(([key, value]) => <div key={key} className={dayTypeMeta[key].dot} style={{ width: `${value}%` }} />)}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-dark">
        {Object.entries(day.split).map(([key, value]) => (
          <span key={key} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${dayTypeMeta[key].dot}`} />{dayTypeMeta[key].label} · {value}%</span>
        ))}
      </div>
    </div>
  );

  const honestView = (
    <section className="grid gap-8 border-b border-border py-10 sm:grid-cols-2">
      <div><h2 className="type-section-title">What people enjoy</h2>
        <ul className="mt-4 space-y-3">{day.best.map((t) => <li key={t} className="flex gap-2 text-base leading-6 text-text-dark"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green" />{t}</li>)}</ul></div>
      <div><h2 className="type-section-title">What can be hard</h2>
        <ul className="mt-4 space-y-3">{day.challenging.map((t) => <li key={t} className="flex gap-2 text-base leading-6 text-text-dark"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />{t}</li>)}</ul></div>
    </section>
  );

  const nextSteps = (
    <section className="py-10">
      <p className="type-eyebrow">Like what you see?</p>
      <h2 className="mt-2 type-section-title">Talk to someone who does this job.</h2>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button icon={ArrowRight} iconPosition="right" onClick={() => navigate("/mentors")}>Browse mentors</Button>
        <Button variant="outline" onClick={() => navigate(`/skill-assessment/${careerId}${suffix}`)}>Know your skills</Button>
      </div>
    </section>
  );

  // ------------------------------------------------------------ intro / browse
  if (phase === "intro" || phase === "browse") {
    return (
      <Layout>
        <div className="mb-6"><BackButton to={`/careers/${careerId}${suffix}`} /></div>
        <header className="border border-border bg-off-white p-6 sm:p-9">
          <p className="type-eyebrow">A day in the life</p>
          <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-dark-green sm:text-5xl">A day as a {title}</h1>
          <p className="mt-3 max-w-xl text-lg leading-7 text-text-dark/80">{day.summary}</p>

          {canPlay && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" icon={Play} onClick={startDay}>Live this day</Button>
              {phase === "intro" && <Button size="lg" variant="outline" icon={BookOpen} onClick={() => setPhase("browse")}>Just read through it</Button>}
              {phase === "browse" && <Button size="lg" variant="outline" onClick={() => setPhase("intro")}>Back</Button>}
            </div>
          )}
          {canPlay && phase === "intro" && (
            <ul className="mt-6 grid max-w-2xl gap-3 text-sm text-text-dark sm:grid-cols-3">
              <li className="rounded-lg bg-light-sage/60 p-3"><span className="font-semibold text-dark-green">{scenes.length} real moments.</span> You make the call in each one.</li>
              <li className="rounded-lg bg-light-sage/60 p-3"><span className="font-semibold text-dark-green">Three meters.</span> Energy, results and team trust shift with every choice.</li>
              <li className="rounded-lg bg-light-sage/60 p-3"><span className="font-semibold text-dark-green">A fit check.</span> See how your instincts compare with the real job.</li>
            </ul>
          )}
          {splitBar}
        </header>
        {phase === "browse" && <Timeline day={day} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />}
        {honestView}
        {nextSteps}
      </Layout>
    );
  }

  // ------------------------------------------------------------ result
  if (phase === "result") {
    const counts = { focus: 0, collab: 0, learn: 0 };
    picks.forEach((optIdx, i) => { counts[scenes[i].options[optIdx].lean] += 1; });
    const total = picks.length || 1;
    const yours = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, (v / total) * 100]));
    const gap = Object.keys(yours).reduce((sum, k) => sum + Math.abs(yours[k] - (day.split[k] || 0)), 0);
    const fit = Math.round(clamp(100 - gap / 2));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const balanced = sorted[0][1] - sorted[2][1] <= 1;
    const persona = balanced
      ? { name: "The All-Rounder", text: "You moved easily between working alone, working with people and learning on the job." }
      : { focus: { name: "The Deep Diver", text: "When in doubt, you roll up your sleeves and solve it yourself." }, collab: { name: "The Connector", text: "You reach for people first, and you get a lot done through them." }, learn: { name: "The Curious Learner", text: "You like to understand the system before you act, and it shows." } }[sorted[0][0]];
    const verdict = fit >= 75
      ? `Your instincts line up closely with how a ${title} really spends the day.`
      : fit >= 55
        ? `Partly a natural fit. A few parts of this day will ask you to stretch.`
        : `This job leans differently from how you chose to work today. That's useful to know, and not a verdict on you.`;
    const tired = meters.energy < 30;

    return (
      <Layout>
        <div className="mb-6"><BackButton to={`/careers/${careerId}${suffix}`} /></div>
        <header className="anim-fade-up border border-border bg-off-white p-6 sm:p-9">
          <p className="type-eyebrow">Day complete · 6 PM</p>
          <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-center">
            <MatchRing value={fit} size={110} strokeWidth={9} valueClassName="text-2xl" />
            <div>
              <p className="type-meta">Your fit with this day</p>
              <h1 className="mt-1 font-heading text-3xl font-bold leading-tight text-dark-green sm:text-4xl">{persona.name}</h1>
              <p className="mt-2 max-w-xl text-base leading-7 text-text-dark/80">{persona.text} {verdict}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {METERS.map((m) => <MeterBar key={m.key} meter={m} value={meters[m.key]} />)}
          </div>
          {tired && <p className="mt-4 rounded-lg bg-coral/10 px-4 py-3 text-sm font-medium text-text-dark">You ended the day running on empty. Real jobs have days like this. Notice which choices drained you most below.</p>}
        </header>

        <section className="grid gap-8 border-b border-border py-10 lg:grid-cols-2">
          <div>
            <h2 className="type-section-title">Your instincts vs the real job</h2>
            <div className="mt-5 space-y-5">
              <SplitBar label="How you worked today" split={yours} />
              <SplitBar label={`How a ${title} really spends the day`} split={day.split} />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-dark">
              {Object.entries(dayTypeMeta).map(([k, m]) => <span key={k} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />{m.label}</span>)}
            </div>
          </div>
          <div>
            <h2 className="type-section-title">Your day, moment by moment</h2>
            <ol className="mt-5 space-y-3">
              {scenes.map((sc, i) => {
                const opt = sc.options[picks[i]];
                return (
                  <li key={sc.time + sc.title} className="flex gap-3 text-sm">
                    <span className="w-16 shrink-0 pt-0.5 text-right font-semibold text-text-muted">{sc.time}</span>
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dayTypeMeta[sc.type].dot}`} />
                    <span className="min-w-0"><span className="font-semibold text-dark-green">{sc.title}</span><br /><span className="text-text-muted">{opt.label}</span></span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 py-8">
          <Button icon={RotateCcw} onClick={startDay}>Replay and choose differently</Button>
          <Button variant="outline" icon={BookOpen} onClick={() => { setPhase("browse"); window.scrollTo({ top: 0 }); }}>Read the full day</Button>
        </div>
        {honestView}
        {nextSteps}
      </Layout>
    );
  }

  // ------------------------------------------------------------ play
  const meta = dayTypeMeta[scene.type];
  const chosen = answered ? scene.options[chosenIndex] : null;
  const isLast = sceneIndex === scenes.length - 1;

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <BackButton to={`/careers/${careerId}${suffix}`} />
          <button type="button" onClick={() => setPhase("intro")} className="focus-ring rounded-full px-3 py-2 text-sm font-semibold text-text-muted hover:bg-light-sage">Leave the day</button>
        </div>

        {/* Dashboard: clock, sun track, meters */}
        <Card elevated className="mb-5 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="type-meta">A day as a {title}</p>
              <p className="font-heading text-4xl font-bold tabular-nums text-dark-green" aria-live="polite" aria-label={`Time: ${scene.time}`}>{formatClock(clock)}</p>
            </div>
            <p className="text-right type-meta">Moment {sceneIndex + 1} of {scenes.length}</p>
          </div>
          <div className="relative mt-4 h-6" aria-hidden="true">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-light-sage" />
            <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-sage transition-all duration-700" style={{ width: `${dayProgress}%` }} />
            {scenes.map((sc, i) => (
              <span key={sc.time + sc.title} className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${i <= sceneIndex ? "bg-dark-green" : "bg-border"}`} style={{ left: `${clamp(((toMinutes(sc.time) - dayStart) / Math.max(1, dayEnd - dayStart)) * 100)}%` }} />
            ))}
            <Sun size={20} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-off-white text-coral transition-all duration-700" style={{ left: `${dayProgress}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {METERS.map((m) => <MeterBar key={m.key} meter={m} value={meters[m.key]} delta={lastDeltas[m.key]} />)}
          </div>
        </Card>

        {/* Scene */}
        <div ref={sceneRef} key={sceneIndex} className="scroll-mt-24">
          <Card elevated className="anim-fade-up p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-dark-green px-3 py-1 text-xs font-bold text-off-white">{scene.time}</span>
              <span className="flex items-center gap-1.5 rounded-full bg-light-sage px-3 py-1 text-xs font-semibold text-dark-green"><span className={`h-2 w-2 rounded-full ${meta.dot}`} />{meta.label}</span>
            </div>
            <h1 className="mt-3 font-heading text-2xl font-bold leading-tight text-dark-green sm:text-3xl">{scene.title}</h1>
            <p className="mt-3 text-base leading-7 text-text-dark">{scene.setup}</p>

            {scene.ping && (
              <div className="anim-ping mt-4 flex items-start gap-3 rounded-xl border border-border bg-cream p-3 shadow-card" role="note">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral/15 text-coral"><Bell size={15} aria-hidden="true" /></span>
                <p className="min-w-0 text-sm leading-6"><span className="font-bold text-dark-green">{scene.ping.from}</span><br /><span className="text-text-dark">{scene.ping.text}</span></p>
              </div>
            )}

            {(day.schedule.find((s) => s.title === scene.title)?.tools || []).length > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-2 type-meta"><Wrench size={13} aria-hidden="true" />Tools in play:
                {day.schedule.find((s) => s.title === scene.title).tools.map((tool) => <span key={tool} className="rounded-full bg-light-sage px-2.5 py-0.5 text-xs font-medium text-dark-green">{tool}</span>)}
              </p>
            )}

            <p className="mb-3 mt-6 text-sm font-semibold text-text-muted">{answered ? "You chose:" : "What do you do?"} {!answered && <span className="font-normal">(press 1, 2 or 3)</span>}</p>
            <div className="flex flex-col gap-3" role="group" aria-label="Your options">
              {scene.options.map((opt, i) => {
                const isChosen = chosenIndex === i;
                return (
                  <button key={opt.label} type="button" disabled={answered} onClick={() => choose(i)} aria-pressed={isChosen}
                    className={`focus-ring flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left text-base font-semibold transition-all duration-200 disabled:cursor-default ${
                      isChosen ? "border-dark-green bg-light-sage text-dark-green" : answered ? "border-border bg-off-white text-text-muted opacity-50" : "border-border bg-off-white text-text-dark hover:-translate-y-0.5 hover:border-sage hover:bg-light-sage/40 hover:shadow-card"}`}>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isChosen ? "bg-dark-green text-off-white" : "bg-light-sage text-dark-green"}`}>{i + 1}</span>
                    <span className="min-w-0">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {chosen && (
              <div className="anim-pop mt-5 rounded-xl border border-sage bg-light-sage/50 p-4" role="status">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-dark-green"><Sparkles size={14} aria-hidden="true" />What happens</p>
                <p className="mt-2 text-base leading-7 text-text-dark">{chosen.result}</p>
                <DeltaChips fx={chosen.fx} />
                <p className="mt-3 type-meta">This reflects: {LEAN_META[chosen.lean].label}</p>
                <Button className="mt-4" size="lg" icon={ArrowRight} iconPosition="right" onClick={next} autoFocus>
                  {isLast ? "End the day" : `Next: ${scenes[sceneIndex + 1].time}`}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
