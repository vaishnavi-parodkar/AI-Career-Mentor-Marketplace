import { useEffect, useState } from "react";
import { Award, Download, FileSpreadsheet, Lock, Brain } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import NextActions from "./NextActions";
import { progressApi, reportApi } from "../services/platformApi";
import { useLanguage } from "../i18n";

/** Server-side progress: readiness score, tracked skill proficiency, badges, interviews, behaviour, reports. */
export default function PlatformProgress() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [behavior, setBehavior] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    progressApi.dashboard().then(setData).catch((e) => setError(e.message));
    progressApi.interviews().then(setInterviews).catch(() => {});
    progressApi.behavior().then(setBehavior).catch(() => {});
  }, []);

  const get = async (kind) => {
    setBusy(kind);
    setError("");
    try { await (kind === "pdf" ? reportApi.pdf() : reportApi.csv()); } catch (e) { setError(e.message); } finally { setBusy(""); }
  };

  return (
    <div className="mt-10 space-y-8">
      <NextActions />
      {error && <p className="text-sm text-coral">{error}</p>}

      {data && (
        <>
          <Card elevated className="grid gap-6 md:grid-cols-[280px_1fr]">
            <div>
              <p className="type-eyebrow">How readiness is scored</p>
              <p className="mt-1 font-heading text-5xl font-bold text-dark-green">{data.readinessScore}<span className="text-xl text-text-muted">/100</span></p>
              <p className="mt-1 text-sm text-text-muted">Same score as the ring above. Each part adds points up to its maximum.</p>
              <ul className="mt-4 space-y-2">
                {(data.readinessBreakdown || []).map((r) => (
                  <li key={r.label}>
                    <div className="flex justify-between text-xs font-semibold text-text-dark"><span>{r.label}</span><span>{r.points}/{r.max}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-light-sage"><div className="h-2 rounded-full bg-dark-green transition-all" style={{ width: `${r.max ? (r.points / r.max) * 100 : 0}%` }} /></div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <p><strong>Roadmap steps:</strong> {data.stepsDone} of {data.stepsTotal}</p>
              <p><strong>Mock interviews:</strong> {data.interviewCount}{data.interviewAverage != null ? ` (avg ${data.interviewAverage}%)` : ""}</p>
              <p><strong>Best ATS score:</strong> {data.bestAtsScore ?? "not analysed yet"}</p>
              <p><strong>Mentor sessions:</strong> {data.sessionsBooked} · open tasks {data.openTasks}</p>
            </div>
          </Card>

          {data.skills.length > 0 && (
            <Card elevated>
              <h2 className="type-section-title">Skill proficiency (updates as you complete roadmap steps)</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {data.skills.map((s) => (
                  <div key={s.skill}>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-text-dark"><span>{s.skill}</span><span>{s.proficiency}%</span></div>
                    <div className="h-2 rounded-full bg-light-sage"><div className="h-2 rounded-full bg-dark-green transition-all" style={{ width: `${s.proficiency}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card elevated>
            <h2 className="type-section-title">Badges</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.badges.map((b) => (
                <div key={b.id} className={`flex items-start gap-3 rounded-xl border p-3 ${b.earned ? "border-dark-green/30 bg-light-sage" : "border-border opacity-70"}`}>
                  {b.earned ? <Award className="mt-0.5 text-dark-green" size={20} aria-hidden="true" /> : <Lock className="mt-0.5 text-text-muted" size={18} aria-hidden="true" />}
                  <div><p className="text-sm font-semibold text-dark-green">{b.title}</p><p className="text-xs text-text-muted">{b.description}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {interviews.length > 0 && (
        <Card elevated>
          <h2 className="type-section-title">Interview performance</h2>
          <div className="mt-4 flex items-end gap-2" aria-label="Interview score trend">
            {[...interviews].reverse().map((i) => (
              <div key={i.id} className="flex flex-col items-center gap-1" title={`${i.careerTitle}: ${i.overall}%`}>
                <div className="w-7 rounded-t bg-dark-green" style={{ height: `${Math.max(6, i.overall)}px` }} />
                <span className="text-[10px] text-text-muted">{i.overall}</span>
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-1 text-sm text-text-muted">
            {interviews.slice(0, 5).map((i) => <li key={i.id}>{i.createdAt.slice(0, 10)} · {i.careerTitle} · {i.overall}% (communication {i.communication}, technical {i.technical})</li>)}
          </ul>
        </Card>
      )}

      {behavior?.ready && (
        <Card elevated>
          <h2 className="flex items-center gap-2 type-section-title"><Brain size={20} aria-hidden="true" /> Your work-style patterns</h2>
          <p className="mt-1 text-xs text-text-muted">Based on {behavior.simulationsCompleted} simulation(s) and your assessment. Tendencies, not a diagnosis.</p>
          {behavior.workStyle && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Object.entries(behavior.workStyle).map(([k, v]) => (
                <div key={k}><div className="mb-1 flex justify-between text-xs font-semibold capitalize text-text-dark"><span>{k}</span><span>{v}%</span></div><div className="h-2 rounded-full bg-light-sage"><div className="h-2 rounded-full bg-sage" style={{ width: `${v}%` }} /></div></div>
              ))}
            </div>
          )}
          <p className="mt-4 whitespace-pre-wrap text-sm text-text-dark">{behavior.narrative}</p>
        </Card>
      )}

      <Card elevated>
        <h2 className="type-section-title">{t("reports.title")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button icon={Download} loading={busy === "pdf"} onClick={() => get("pdf")}>PDF report</Button>
          <Button variant="outline" icon={FileSpreadsheet} loading={busy === "csv"} onClick={() => get("csv")}>CSV export</Button>
        </div>
      </Card>
    </div>
  );
}
