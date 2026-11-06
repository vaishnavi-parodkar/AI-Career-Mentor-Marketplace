import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Sparkles, Compass, ArrowRight, Lightbulb, TrendingUp, Check, Plus } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import MatchRing from "../components/MatchRing";
import { useAssessment } from "../context/AssessmentContext";
import { profileApi, careerApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { buildInsights, TRAIT_LABEL } from "../utils/insights";

export default function AssessmentResult() {
  const navigate = useNavigate();
  const { result } = useAssessment();
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [serverMatch, setServerMatch] = useState(null);

  useEffect(() => { if (!result) navigate("/assessment"); }, [result, navigate]);
  useEffect(() => {
    profileApi.getProfile().then((r) => { if (r?.success && r.profile) setProfile(r.profile); }).catch(() => {});
  }, []);

  useEffect(() => {
    careerApi.getRecommendations(user?.id).then((r) => {
      if (r?.success && Array.isArray(r.recommendations)) setServerMatch(Object.fromEntries(r.recommendations.map((x) => [x.careerId, x.matchPercentage])));
    }).catch(() => {});
  }, [user?.id]);

  if (!result) return null;
  const base = buildInsights(result, profile);
  // The server's match % is the single source of truth (same number as Home and Careers pages).
  const ranked = serverMatch
    ? base.ranked.filter((c) => c.id in serverMatch).map((c) => ({ ...c, match: serverMatch[c.id] })).sort((a, b) => b.match - a.match)
    : base.ranked;
  const ins = { ...base, ranked };
  const rows = [
    { icon: Target, label: "Top interest", value: result.topInterest },
    { icon: Sparkles, label: "Your strengths", value: result.strengths },
    { icon: Compass, label: "Work preference", value: result.workPreference },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-dark-green p-6 text-off-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">Your career personality</p>
          <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">The {ins.persona}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-off-white/80">
            You score highest in {ins.top.map((t) => TRAIT_LABEL[t].toLowerCase()).join(" and ")} thinking. Pathwise combined this with your profile skills to rank roles that suit you.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.label} elevated className="flex flex-col gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-sage text-dark-green"><r.icon size={18} aria-hidden="true" /></span>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{r.label}</p>
              <p className="text-sm font-medium text-text-dark">{r.value}</p>
            </Card>
          ))}
        </div>

        <Card elevated className="mt-5">
          <h2 className="font-heading text-xl font-bold text-dark-green">Trait breakdown</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {Object.entries(ins.pct).sort((a, b) => b[1] - a[1]).map(([t, v]) => (
              <li key={t}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-semibold text-text-dark">{TRAIT_LABEL[t]}</span><span className="text-text-muted">{v}%</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-light-sage" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={TRAIT_LABEL[t]}>
                  <div className="h-full rounded-full bg-green transition-[width] duration-700" style={{ width: `${v}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {ins.weakest && (
            <p className="mt-5 flex gap-3 rounded-xl bg-light-sage/60 p-4 text-sm leading-6 text-text-dark">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-dark-green" aria-hidden="true" />
              <span><b>Growth area: {TRAIT_LABEL[ins.weakest]}.</b> {ins.tip}</span>
            </p>
          )}
        </Card>

        <h2 className="mb-3 mt-8 font-heading text-xl font-bold text-dark-green">Your top career matches</h2>
        <div className="flex flex-col gap-4">
          {ins.ranked.slice(0, 3).map((c, i) => (
            <Card key={c.id} elevated interactive className="flex flex-col gap-4 sm:flex-row">
              <MatchRing value={c.match} size={80} label="career match" strokeWidth={7} valueClassName="text-lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-dark-green">{c.title}</h3>
                  {i === 0 && <span className="rounded-full bg-dark-green px-2.5 py-0.5 text-xs font-semibold text-off-white">Best fit</span>}
                </div>
                <p className="mt-1 text-sm leading-6 text-text-muted">{c.why}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-text-muted"><TrendingUp size={14} aria-hidden="true" />{c.market.demand} demand · {c.market.avgSalary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.have.map((s) => <span key={s} className="inline-flex items-center gap-1 rounded-full bg-light-sage px-2.5 py-1 text-xs font-semibold text-dark-green"><Check size={12} aria-hidden="true" />{s}</span>)}
                  {c.missing.slice(0, 3).map((s) => <span key={s} className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-text-muted"><Plus size={12} aria-hidden="true" />{s}</span>)}
                </div>
                <button type="button" onClick={() => navigate(`/careers/${c.id}`)} className="focus-ring mt-3 text-sm font-semibold text-dark-green hover:underline">Explore this path →</button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" size="lg" fullWidth icon={ArrowRight} iconPosition="right" onClick={() => navigate("/careers")}>View all career matches</Button>
          <Button variant="outline" size="lg" fullWidth onClick={() => navigate("/skill-gap")}>See my skill gap</Button>
        </div>
      </div>
    </Layout>
  );
}
