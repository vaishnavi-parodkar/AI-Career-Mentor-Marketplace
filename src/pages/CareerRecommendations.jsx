import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GitCompare, RotateCcw } from "lucide-react";
import Layout from "../components/Layout";
import CareerCard from "../components/CareerCard";
import MatchRing from "../components/MatchRing";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { careerApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CareerRecommendations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isBrowseMode = searchParams.get("mode") === "browse";
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadRecommendations = async () => {
      setLoading(true);
      setError("");
      try {
        if (isBrowseMode) {
          const catalogue = await careerApi.getAll();
          if (active) setCareers(catalogue.map((career) => ({ ...career, match: undefined })));
          return;
        }

        const recommendationResponse = await careerApi.getRecommendations(user?.id);
        if (!recommendationResponse.success) {
          if (active) { setCareers([]); setError(recommendationResponse.message || "Personalized matches are not available yet."); }
          return;
        }
        if (recommendationResponse.recommendations.length === 0) {
          if (active) setCareers([]);
          return;
        }

        const detailResponses = await Promise.all(recommendationResponse.recommendations.map((recommendation) => careerApi.getDetailsById(recommendation.careerId)));
        const failedDetail = detailResponses.find((response) => !response.success);
        if (failedDetail) {
          if (active) setError(failedDetail.message || "Some career details could not be loaded.");
          return;
        }

        const detailsById = new Map(detailResponses.map((response) => [response.career.id, response.career]));
        const mergedCareers = recommendationResponse.recommendations.map((recommendation) => {
          const details = detailsById.get(recommendation.careerId);
          if (!details) return null;
          return { ...details, id: recommendation.careerId, match: recommendation.matchPercentage, matchPercentage: recommendation.matchPercentage, strongestTraits: recommendation.strongestTraits || [], growthAreas: recommendation.growthAreas || [] };
        }).filter(Boolean).sort((a, b) => b.match - a.match);
        if (active) setCareers(mergedCareers);
      } catch {
        if (active) { setCareers([]); setError("We could not load this Pathwise view right now."); }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadRecommendations();
    return () => { active = false; };
  }, [isBrowseMode, user?.id, retryKey]);

  const strongestMatch = !isBrowseMode ? careers[0] : null;

  return (
    <Layout>
      <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-2xl"><p className="type-eyebrow">{isBrowseMode ? "Career catalogue" : "Your assessment-based matches"}</p><h1 className="mt-2 type-page-title">{isBrowseMode ? "Explore careers" : "Your career matches"}</h1><p className="mt-3 type-body">{isBrowseMode ? "Browse the six career paths currently supported by Pathwise. Match percentages appear only after the assessment." : "These paths are ranked from your assessment responses. The percentage is a fit signal against the traits you surfaced, not a promise of an outcome."}</p></div>{!isBrowseMode && <Button variant="outline" icon={GitCompare} onClick={() => navigate("/compare")}>Compare careers</Button>}</div>
      {loading ? <Loader label={isBrowseMode ? "Loading career catalogue..." : "Finding your best matches..."} /> : error ? <div className="flex flex-col items-start gap-4 border-l-2 border-coral bg-off-white px-5 py-4"><p className="type-supporting text-text-dark">{error}</p><Button variant="outline" size="sm" icon={RotateCcw} onClick={() => setRetryKey((key) => key + 1)}>Try again</Button></div> : careers.length === 0 ? <div className="border-l-2 border-sage bg-light-sage/40 px-5 py-4 type-supporting text-text-dark">{isBrowseMode ? "The career catalogue is not available right now." : "No career recommendations are available yet. Complete the assessment to create your personalized view."}</div> : <>{strongestMatch && Number.isFinite(Number(strongestMatch.match)) && <div className="mb-9 flex flex-col gap-4 border-y border-border py-6 sm:flex-row sm:items-center sm:gap-6"><MatchRing value={strongestMatch.match} size={88} strokeWidth={8} valueClassName="text-xl" /><div><p className="type-eyebrow">Strongest current match</p><h2 className="mt-1 font-heading text-2xl font-bold text-dark-green">{strongestMatch.title}</h2><p className="mt-1 type-supporting">Start here to see the assessment traits behind the recommendation, the role itself, and the skills you can build next.</p></div></div>}<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{careers.map((career, index) => <CareerCard key={career.id} career={career} isTopMatch={!isBrowseMode && index === 0} showMatch={!isBrowseMode} />)}</div></>}
    </Layout>
  );
}
