import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Sparkles, ArrowRight, Users } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Card from "../components/Card";
import CareerCard from "../components/CareerCard";
import Loader from "../components/Loader";
import { careerApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadPersonalizedHome = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await careerApi.getRecommendations(user?.id);
        if (!response.success) {
          if (!active) return;
          setCareers([]);
          setAssessmentComplete(false);
          setError(response.message || "Complete the assessment to unlock your matches.");
          return;
        }
        const detailResponses = await Promise.all(response.recommendations.slice(0, 3).map((recommendation) => careerApi.getDetailsById(recommendation.careerId)));
        if (!active) return;
        setCareers(detailResponses.filter((item) => item.success).map((item) => {
          const recommendation = response.recommendations.find((match) => match.careerId === item.career.id);
          return { ...item.career, match: recommendation.matchPercentage, matchPercentage: recommendation.matchPercentage, strongestTraits: recommendation.strongestTraits, growthAreas: recommendation.growthAreas };
        }));
        setAssessmentComplete(true);
      } catch {
        if (active) setError("We could not load your matches right now.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadPersonalizedHome();
    return () => { active = false; };
  }, [user?.id]);

  const firstName = user?.fullName?.split(" ")[0] || "there";
  const nextStep = assessmentComplete
    ? { eyebrow: "Next step", title: "Review your career matches", text: "Your assessment is complete. Explore the paths and the reasoning behind each one.", action: "View career matches", route: "/careers" }
    : { eyebrow: "Start here", title: "Complete your assessment", text: "Answer a few honest questions to see which of Pathwise's six supported paths fit your patterns.", action: "Take the assessment", route: "/assessment" };

  return (
    <Layout>
      <section className="mb-12 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="type-eyebrow mb-2">Hi {firstName},</p>
          <h1 className="type-page-title mb-4 text-4xl lg:text-5xl">Find the career that fits you.</h1>
          <p className="mb-7 max-w-xl type-body">Discover your strengths, explore careers, and turn a possible direction into a practical next step.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg" icon={Sparkles} onClick={() => navigate(assessmentComplete ? "/careers" : "/assessment")}>
              {assessmentComplete ? "View career matches" : "Take the assessment"}
            </Button>
            {assessmentComplete ? <Button variant="outline" size="lg" icon={Compass} onClick={() => navigate("/assessment")}>Retake assessment</Button> : <Button variant="outline" size="lg" icon={Compass} onClick={() => navigate("/careers?mode=browse")}>Browse careers</Button>}
          </div>
        </div>

        <Card className="bg-light-sage/55 p-6 sm:p-7" elevated>
          <p className="type-eyebrow">{nextStep.eyebrow}</p>
          <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-dark-green">{nextStep.title}</h2>
          <p className="mt-3 type-supporting text-text-dark">{nextStep.text}</p>
          <Button className="mt-6" variant="outline" icon={ArrowRight} iconPosition="right" onClick={() => navigate(nextStep.route)}>{nextStep.action}</Button>
        </Card>
      </section>

      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="type-eyebrow">Your discovery space</p><h2 className="mt-1 type-section-title">{assessmentComplete ? "Recommended career matches" : "Explore career paths"}</h2></div>
          <button type="button" onClick={() => navigate(assessmentComplete ? "/careers" : "/careers?mode=browse")} className="focus-ring inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-dark-green">View all <ArrowRight size={15} aria-hidden="true" /></button>
        </div>

        {loading ? <Loader label="Loading your matches..." /> : error && careers.length === 0 ? <div className="border-l-2 border-sage bg-light-sage/40 px-5 py-4 type-supporting text-text-dark">{error} You can still browse every supported career path.</div> : careers.length > 0 ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{careers.map((career) => <CareerCard key={career.id} career={career} />)}</div> : <div className="border-l-2 border-sage bg-light-sage/40 px-5 py-4 type-supporting text-text-dark">Complete the assessment to unlock matches based on your responses. You can still browse every supported career path.</div>}
      </section>

      <section>
        <Card className="flex flex-col items-start gap-5 border-dark-green bg-dark-green p-7 text-left sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-off-white/10 text-off-white"><Users size={26} aria-hidden="true" /></div>
          <div className="flex-1"><h3 className="font-heading text-xl font-bold text-off-white">Need perspective on the road ahead?</h3><p className="mt-1 text-base leading-7 text-off-white/85">Talk with profession-specific AI mentors about skills, projects, and interview preparation.</p></div>
          <Button variant="coral" onClick={() => navigate("/mentors")}>Meet mentors</Button>
        </Card>
      </section>
    </Layout>
  );
}
