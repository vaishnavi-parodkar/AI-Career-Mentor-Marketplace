import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Circle } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { roadmapStages } from "../data/roadmap";
import { useAssessment } from "../context/AssessmentContext";
import { careerApi } from "../services/api";

const statusStyles = {
  complete: { icon: Circle, color: "text-text-muted", bg: "bg-border" },
  "in-progress": { icon: Circle, color: "text-text-muted", bg: "bg-border" },
  upcoming: { icon: Circle, color: "text-text-muted", bg: "bg-border" },
};

export default function Roadmap() {
  const navigate = useNavigate();
  const { selectedCareerId } = useAssessment();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(Boolean(selectedCareerId));
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!selectedCareerId) return undefined;
    const loadCareer = async () => {
      setLoading(true); setError("");
      try {
        const response = await careerApi.getDetailsById(selectedCareerId);
        if (!response.success) throw new Error(response.message);
        if (active) setCareer(response.career);
      } catch (requestError) {
        if (active) setError(requestError.message || "Roadmap context is not available right now.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCareer();
    return () => { active = false; };
  }, [selectedCareerId]);

  if (loading) return <Layout><p className="py-16 text-center type-supporting">Loading roadmap context...</p></Layout>;
  if (!selectedCareerId || !career) return <Layout><Card className="mx-auto max-w-xl text-center" elevated><p className="type-eyebrow">Your next step</p><h1 className="mt-2 type-section-title">Suggested career roadmap</h1><p className="mt-3 type-supporting">{error || "Select a career to view its suggested roadmap."}</p><Button className="mt-6" variant="primary" onClick={() => navigate("/careers")}>View career recommendations</Button></Card></Layout>;

  return <Layout><div className="mb-9"><p className="type-eyebrow">Keep moving</p><h1 className="mt-2 type-page-title">Suggested career roadmap</h1><p className="mt-3 max-w-2xl type-body">A suggested sequence for becoming job-ready in <span className="font-semibold text-dark-green">{career.title}</span>. It does not track personal progress yet.</p></div><div className="relative mx-auto max-w-2xl">{roadmapStages.map((stage, index) => { const style = statusStyles[stage.status]; const Icon = style.icon; const isLast = index === roadmapStages.length - 1; return <div key={stage.id} className="relative flex gap-5 pb-9">{!isLast && <div className="absolute left-[19px] top-10 h-full w-0.5 bg-border" />}<div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.bg} text-off-white`}><Icon size={19} aria-hidden="true" /></div><Card className="flex-1" elevated><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading text-xl font-bold text-dark-green">{stage.title}</h3><span className={`type-meta ${style.color}`}>Suggested stage</span></div><p className="type-supporting">{stage.description}</p></Card></div>; })}</div><div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row"><Button variant="outline" size="lg" fullWidth onClick={() => navigate("/skill-gap")}>View skill gaps</Button><Button variant="primary" size="lg" fullWidth onClick={() => navigate("/mock-interview")}>Start mock interview</Button></div></Layout>;
}
