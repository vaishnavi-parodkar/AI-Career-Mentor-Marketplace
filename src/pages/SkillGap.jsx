import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { useAssessment } from "../context/AssessmentContext";
import { careerApi } from "../services/api";

export default function SkillGap() {
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
        if (active) setError(requestError.message || "Required skills are not available right now.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCareer();
    return () => { active = false; };
  }, [selectedCareerId]);

  if (loading) return <Layout><p className="py-16 text-center type-supporting">Loading required skills...</p></Layout>;
  if (error) return <Layout><div className="mx-auto flex max-w-xl flex-col items-start gap-4 py-10"><p className="type-supporting text-text-dark">{error}</p><Button variant="outline" onClick={() => navigate("/careers")}>Back to careers</Button></div></Layout>;
  if (!career) return <Layout><Card className="mx-auto max-w-xl text-center" elevated><p className="type-eyebrow">Skill readiness</p><h1 className="mt-2 type-section-title">Required skills</h1><p className="mt-3 type-supporting">Select a career from your recommendations to view its required skills.</p><Button className="mt-6" variant="primary" onClick={() => navigate("/careers")}>View career recommendations</Button></Card></Layout>;

  return <Layout><div className="mb-8"><p className="type-eyebrow">Build your foundation</p><h1 className="mt-2 type-page-title">Skill gap analysis</h1><p className="mt-3 type-body">Required skills for <span className="font-semibold text-dark-green">{career.title}</span>.</p></div><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Card elevated><p className="type-eyebrow">Role requirements</p><h2 className="mt-2 type-section-title">Required skills</h2>{career.skills.length > 0 ? <p className="mt-5 text-base leading-8 text-text-dark">{career.skills.join(" · ")}</p> : <p className="mt-4 type-supporting">No required skills are available for this career yet.</p>}</Card><Card elevated><p className="type-eyebrow">Your next step</p><h2 className="mt-2 type-section-title">Skill progress</h2><p className="mt-3 type-supporting">Your current proficiency and learning progress are not available yet. Use these required skills as a guide for your development.</p><Button variant="primary" fullWidth className="mt-6" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/roadmap")}>View my roadmap</Button></Card></div></Layout>;
}
