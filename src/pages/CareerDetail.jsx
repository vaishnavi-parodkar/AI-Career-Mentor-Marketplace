import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, DollarSign, Globe2, MapPin, RotateCcw, TrendingUp } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import MatchSummary from "../components/MatchSummary";
import MarketTrendChart from "../components/MarketTrendChart";
import MetricCard from "../components/MetricCard";
import CareerImage from "../components/CareerImage";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import { careerContent, defaultCareerContent } from "../data/careerContent";
import { marketInsights } from "../data/marketInsights";
import { careerApi, skillAssessmentApi } from "../services/api";
import { useAssessment } from "../context/AssessmentContext";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  STRONG: { label: "Strong", bar: "bg-green", badge: "bg-light-sage text-dark-green" },
  DEVELOPING: { label: "Developing", bar: "bg-sage", badge: "bg-light-sage text-dark-green" },
  NEEDS_DEVELOPMENT: { label: "Needs development", bar: "bg-coral", badge: "bg-coral/15 text-text-dark" },
  NOT_ASSESSED: { label: "Not assessed", bar: "bg-border", badge: "bg-cream text-text-muted" },
};

const formatMarketChange = (values) => {
  if (!Array.isArray(values) || values.length < 2) return "Not available";
  const change = values[values.length - 1] - values[0];
  return `${change >= 0 ? "+" : ""}${change} index points`;
};

export default function CareerDetail() {
  const { career: careerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setSelectedCareerId } = useAssessment();
  const isBrowseMode = searchParams.get("mode") === "browse";
  const [career, setCareer] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const hasBackendUser = Number.isInteger(user?.id) && user.id > 0;
  const canLoadRecommendation = hasBackendUser && !isBrowseMode;

  useEffect(() => {
    let active = true;
    const loadCareer = async () => {
      setLoading(true);
      setError("");
      try {
        const [detailsResponse, recommendationResponse, skillGapResponse] = await Promise.all([
          careerApi.getDetailsById(careerId),
          canLoadRecommendation ? careerApi.getRecommendationByCareerId(user.id, careerId) : Promise.resolve({ success: false }),
          hasBackendUser ? skillAssessmentApi.getSkillGap(user.id, careerId) : Promise.resolve({ success: false }),
        ]);
        if (!detailsResponse.success) throw new Error(detailsResponse.message || "Career not found.");
        const recommendation = recommendationResponse.success ? recommendationResponse.recommendation : null;
        if (active) {
          setCareer({
            ...detailsResponse.career,
            ...(recommendation && {
              matchPercentage: recommendation.matchPercentage,
              strongestTraits: recommendation.strongestTraits || [],
              growthAreas: recommendation.growthAreas || [],
            }),
          });
          setSkillGap(skillGapResponse.success ? skillGapResponse : null);
        }
      } catch (requestError) {
        if (active) {
          setCareer(null);
          setSkillGap(null);
          setError(requestError.message || "We could not load this career right now.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCareer();
    return () => { active = false; };
  }, [careerId, canLoadRecommendation, hasBackendUser, user, retryKey]);

  const handleKnowYourSkills = () => {
    setSelectedCareerId(careerId);
    navigate(`/skill-assessment/${careerId}${isBrowseMode ? "?mode=browse" : ""}`);
  };

  const handleSelectCareer = () => {
    setSelectedCareerId(careerId);
    navigate("/roadmap");
  };

  if (loading) return <Layout><Loader label="Loading career overview..." />;</Layout>;
  if (!career) return <Layout><div className="mx-auto flex max-w-xl flex-col items-start gap-4 py-10"><p className="type-supporting text-text-dark">{error || "Career not found."}</p><Button variant="outline" icon={RotateCcw} onClick={() => setRetryKey((key) => key + 1)}>Try again</Button></div></Layout>;

  const content = careerContent[career.id] || defaultCareerContent;
  const marketInsight = marketInsights[career.id];
  const hasFitDetails = !isBrowseMode && Boolean(career.strongestTraits?.length || career.growthAreas?.length);
  const attentionSkills = skillGap?.assessmentCompleted ? skillGap.skills.filter((skill) => ["NEEDS_DEVELOPMENT", "NOT_ASSESSED"].includes(skill.status)) : [];

  return (
    <Layout>
      <div className="mb-6"><BackButton to={isBrowseMode ? "/careers?mode=browse" : "/careers"} /></div>

      <header className="overflow-hidden border border-border bg-off-white">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-6 sm:p-9 lg:p-11">
            <p className="type-eyebrow">Career overview</p>
            <h1 className="mt-3 max-w-2xl font-heading text-4xl font-bold leading-tight text-dark-green sm:text-5xl">{career.title}</h1>
            <p className="mt-3 max-w-xl text-lg leading-7 text-text-dark/80">{career.tagline}</p>
            {!isBrowseMode && <MatchSummary value={career.matchPercentage} />}
            {isBrowseMode && <div className="mt-8 border-t border-border pt-6"><p className="type-eyebrow">Catalogue view</p><p className="mt-2 max-w-xl type-supporting text-text-dark">You are exploring this role without a personalized match. Complete the assessment to see how it compares with your strengths.</p></div>}
          </div>
          <CareerImage content={content} className="min-h-[280px] aspect-[4/3] sm:min-h-[340px] lg:min-h-[420px] lg:aspect-auto" loading="lazy" fetchPriority="low" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-3 lg:gap-x-12">
        <main className="lg:col-span-2">
          <section className="border-b border-border py-10">
            <p className="type-eyebrow">The role</p>
            <h2 className="mt-2 type-section-title">What this career involves</h2>
            <p className="mt-4 max-w-prose type-body">{career.description}</p>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div><h3 className="text-base font-bold text-dark-green">What the work looks like</h3><p className="mt-2 type-supporting">{content.whatTheyDo}</p></div>
              <div><h3 className="text-base font-bold text-dark-green">Typical work environment</h3><p className="mt-2 type-supporting">{content.environment}</p></div>
              <div><h3 className="text-base font-bold text-dark-green">Who it may suit</h3><p className="mt-2 type-supporting">{content.suitedFor}</p></div>
              <div><h3 className="text-base font-bold text-dark-green">Why it matters</h3><p className="mt-2 type-supporting">{content.whyItMatters}</p></div>
            </div>
          </section>

          {hasFitDetails && <section className="border-b border-border py-10">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="type-eyebrow">Your recommendation</p><h2 className="mt-2 type-section-title">Why this career fits you</h2></div>{Number.isFinite(career.matchPercentage) && <p className="font-heading text-3xl font-bold text-dark-green">{career.matchPercentage}% <span className="font-body text-sm font-medium text-text-muted">match</span></p>}</div>
            <p className="mt-4 max-w-prose type-supporting">Pathwise uses your assessment traits to explain the fit. Your skill readiness remains separate and appears only after the career-specific assessment.</p>
            <div className="mt-7 grid gap-8 sm:grid-cols-2">
              {career.strongestTraits?.length > 0 && <div><h3 className="text-base font-bold text-dark-green">Strongest traits</h3><ul className="mt-3 space-y-3">{career.strongestTraits.map((trait) => <li key={trait} className="flex gap-2 text-base leading-6 text-text-dark"><CheckCircle2 size={17} className="mt-1 shrink-0 text-green" aria-hidden="true" />{trait}</li>)}</ul></div>}
              {career.growthAreas?.length > 0 && <div><h3 className="text-base font-bold text-dark-green">Growth areas</h3><ul className="mt-3 space-y-3">{career.growthAreas.map((area) => <li key={area} className="flex gap-2 text-base leading-6 text-text-dark"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />{area}</li>)}</ul></div>}
            </div>
          </section>}

          <section className="border-b border-border py-10">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="type-eyebrow">Build your foundation</p><h2 className="mt-2 type-section-title">Key Skills</h2><p className="mt-3 type-supporting">These are the skills Pathwise will assess for this specific career.</p></div><Button variant="outline" icon={ArrowRight} iconPosition="right" onClick={handleKnowYourSkills}>Know your skills</Button></div>
            <p className="mt-6 text-base leading-7 text-text-dark">{career.skills.join(" · ")}</p>
          </section>

          <section className="border-b border-border py-10">
            <p className="type-eyebrow">Career-specific assessment</p>
            <h2 className="mt-2 type-section-title">Your Skill Readiness</h2>
            {skillGap?.assessmentCompleted ? <>
              <p className="mt-3 max-w-prose type-supporting">Each bar represents your reported skill level on a 1–5 scale. Use the status to decide where focused practice may help most.</p>
              <div className="mt-7 divide-y divide-border border-y border-border">{skillGap.skills.map((skill) => {
                const style = statusStyles[skill.status] || statusStyles.NOT_ASSESSED;
                const score = Number(skill.userScore);
                const hasScore = Number.isFinite(score);
                return <div key={skill.skillId} className="py-5"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><p className="text-base font-semibold text-dark-green">{skill.skillName}</p>{skill.required && <span className="type-meta">Required</span>}</div><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}>{style.label}</span>{hasScore && <span className="text-sm font-semibold text-dark-green">{score.toFixed(1)} / 5</span>}</div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-light-sage" role="progressbar" aria-label={`${skill.skillName} skill level`} aria-valuemin="0" aria-valuemax="5" aria-valuenow={hasScore ? score : 0}><div className={`h-full rounded-full ${style.bar}`} style={{ width: `${hasScore ? Math.max(0, Math.min(score, 5)) * 20 : 0}%` }} /></div><p className="mt-2 text-sm text-text-muted">{hasScore ? `Skill level: ${skill.userLevel || "Not available"} (1–5 scale)` : "Skill level has not been assessed."}</p></div>;
              })}</div>
              {attentionSkills.length > 0 && <p className="mt-5 border-l-2 border-coral pl-4 text-base leading-7 text-text-dark">Start with <span className="font-semibold text-dark-green">{attentionSkills.map((skill) => skill.skillName).join(", ")}</span>. These are marked for development or not yet assessed.</p>}
            </> : <div className="mt-5 border-l-2 border-sage bg-light-sage/45 px-4 py-4 type-supporting text-text-dark">See how your current experience maps to this career&apos;s required skills. Take the short, career-specific assessment using <span className="font-semibold text-dark-green">Know your skills</span>.</div>}
          </section>

          <section className="border-b border-border py-10"><p className="type-eyebrow">Day-to-day work</p><h2 className="mt-2 type-section-title">Responsibilities</h2><ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">{career.responsibilities.map((responsibility) => <li key={responsibility} className="flex items-start gap-2.5 text-base leading-7 text-text-dark"><CheckCircle2 size={17} className="mt-1.5 shrink-0 text-green" aria-hidden="true" />{responsibility}</li>)}</ul></section>

          <section className="border-b border-border py-10"><p className="type-eyebrow">Build a long view</p><h2 className="mt-2 type-section-title">Career Growth</h2>{career.growth && <p className="mt-3 type-supporting">{career.growth}</p>}<ol className="mt-8 space-y-0">{content.stages.map(([stage, description], index) => <li key={stage} className="relative flex gap-4 pb-8 last:pb-0"><div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dark-green text-xs font-semibold text-off-white">{index + 1}</div>{index < content.stages.length - 1 && <div className="absolute left-4 top-8 h-[calc(100%-1rem)] w-px bg-border" />}<div className="pt-0.5"><h3 className="text-base font-bold text-dark-green">{stage}</h3><p className="mt-1 type-supporting">{description}</p></div></li>)}</ol></section>

          <section className="border-b border-border py-10"><p className="type-eyebrow">Ways to specialize</p><h2 className="mt-2 type-section-title">Career Opportunities</h2><p className="mt-3 type-supporting">With experience, this path can open into focused roles such as:</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{content.opportunities.map((opportunity) => <div key={opportunity} className="border-l-2 border-sage py-1 pl-3 text-base font-semibold text-dark-green">{opportunity}</div>)}</div></section>

          <section className="border-b border-border py-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="type-eyebrow">Market context</p><h2 className="mt-2 type-section-title">Market Insights</h2><p className="mt-3 max-w-prose type-supporting">A normalized view of how this career&apos;s market signal changed from 2021 to 2025.</p></div><Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/market-insights")}>Explore all insights</Button></div>{marketInsight ? <><div className="mt-7 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]"><MarketTrendChart values={marketInsight.values} title={marketInsight.title} /><div className="border-l-2 border-sage pl-5"><p className="type-eyebrow">Market direction</p><h3 className="mt-2 font-heading text-2xl font-bold text-dark-green">{marketInsight.direction}</h3><p className="mt-4 type-supporting"><span className="font-semibold text-dark-green">Key trend:</span> {marketInsight.trend}</p><div className="mt-6 grid grid-cols-2 gap-4"><div><p className="type-meta">2025 index</p><p className="mt-1 font-heading text-2xl font-bold text-dark-green">{marketInsight.values[marketInsight.values.length - 1]}</p></div><div><p className="type-meta">Since 2021</p><p className="mt-1 font-heading text-lg font-bold text-dark-green">{formatMarketChange(marketInsight.values)}</p></div></div><p className="mt-7 type-meta">Key skills</p><p className="mt-2 text-base leading-7 text-text-dark">{marketInsight.skills.join(" · ")}</p></div></div><p className="mt-6 text-sm leading-6 text-text-muted">Market trend values are normalized indicators used for visualization and are not absolute job-opening counts.</p></> : <p className="mt-5 border-l-2 border-sage bg-light-sage/45 px-4 py-4 type-supporting text-text-dark">Market context is not available for this career yet.</p>}</section>
        </main>

        <aside className="border-t border-border py-10 lg:border-l lg:border-t-0 lg:pl-8"><h2 className="font-heading text-2xl font-bold text-dark-green">Market Information</h2><p className="mt-2 type-supporting">Current career metadata from Pathwise.</p><div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1"><MetricCard icon={DollarSign} label="Avg. Salary" value={career.market?.avgSalary || "Not available"} /><MetricCard icon={TrendingUp} label="Job Demand" value={career.market?.demand || "Not available"} /><MetricCard icon={MapPin} label="Top Location" value={career.market?.topLocation || "Not available"} /><MetricCard icon={Globe2} label="Global Opportunities" value={career.market?.globalOpportunities || "Not available"} /></div>{career.salaryRange && <p className="mt-6 border-t border-border pt-5 type-supporting">Salary range: <span className="font-semibold text-dark-green">{career.salaryRange}</span></p>}<div className="mt-8 border-t border-border pt-6"><p className="type-eyebrow">Ready for the next step?</p><h3 className="mt-2 font-heading text-xl font-bold text-dark-green">Make this your career focus.</h3><p className="mt-2 type-supporting">Choose this direction to open the suggested Pathwise roadmap.</p><Button className="mt-5" fullWidth icon={ArrowRight} iconPosition="right" onClick={handleSelectCareer}>Choose this career</Button></div></aside>
      </div>
    </Layout>
  );
}
