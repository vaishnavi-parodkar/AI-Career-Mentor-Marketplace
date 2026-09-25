import { useEffect, useState } from "react";
import { CheckCircle2, Map, TrendingUp } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import MatchRing from "../components/MatchRing";
import { roadmapApi, skillAssessmentApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useAssessment } from "../context/AssessmentContext";

export default function ProgressDashboard() {
  const { user } = useAuth();
  const { selectedCareerId } = useAssessment();
  const [roadmapProgress, setRoadmapProgress] = useState(0);
  const [skillsProgress, setSkillsProgress] = useState(0);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [readiness, setReadiness] = useState(0);

  const stats = [
    { icon: CheckCircle2, label: "Assessment completion", value: assessmentCompleted ? 100 : 0, },
    { icon: TrendingUp, label: "Skills progress", value: skillsProgress },
    { icon: Map, label: "Roadmap progress", value: roadmapProgress },
  ];

  useEffect(() => {
    const loadRoadmapProgress = async () => {
      if (!user?.id) return;

      const response = await roadmapApi.getByUser(user.id);

      if (!response.success) return;

      const roadmaps = Array.isArray(response.roadmaps)
        ? response.roadmaps
        : [];

      const matchingRoadmaps = selectedCareerId
        ? roadmaps.filter(
            (roadmap) => roadmap.career?.careerId === selectedCareerId
          )
        : roadmaps;

      const currentRoadmap = matchingRoadmaps.reduce(
        (latest, current) =>
          !latest || current.id > latest.id ? current : latest,
        null
      );

      const steps = Array.isArray(currentRoadmap?.steps)
        ? currentRoadmap.steps
        : [];

      if (steps.length === 0) {
        setRoadmapProgress(0);
        return;
      }

      const completedSteps = steps.filter(
        (step) => step.completed
      ).length;

      setRoadmapProgress(
        Math.round((completedSteps / steps.length) * 100)
      );
    };



    loadRoadmapProgress();
  }, [user?.id, selectedCareerId]);

  useEffect(() => {
    const loadSkillsProgress = async () => {
    if (!user?.id || !selectedCareerId) return;

      const response = await skillAssessmentApi.getSkillGap(
        user.id,
        selectedCareerId
      );

      setAssessmentCompleted(response.assessmentCompleted === true);

      if (!response.success) return;

      const skills = Array.isArray(response.skills)
        ? response.skills
        : [];

      if (skills.length === 0) {
        setSkillsProgress(0);
        return;
      }

      const totalProgress = skills.reduce((total, skill) => {
        const score = Number(skill.userScore);

        if (!Number.isFinite(score)) return total;

        return total + Math.max(0, Math.min(5, score)) * 20;
      }, 0);

      setSkillsProgress(
        Math.round(totalProgress / skills.length)
      );
    };

    loadSkillsProgress();
  }, [user?.id, selectedCareerId]);

  useEffect(() => {
    const loadCareerReadiness = async () => {
      if (!user?.id || !selectedCareerId) return;

      const response = await skillAssessmentApi.getSkillGap(
        user.id,
        selectedCareerId
      );

      if (!response.success) return;

      const skills = Array.isArray(response.skills)
        ? response.skills
        : [];

      if (skills.length === 0) {
        setReadiness(0);
        return;
      }

      const result = await skillAssessmentApi.analyzeSkillGap({
        userId: user.id,
        careerId: selectedCareerId,
        skills: skills.map((skill) => ({
          name: skill.skillName ?? skill.name,
          value: Number(skill.userScore) * 20,
        })),
        resumeContext: "",
      });

      if (!result.success) return;

      const overallReadiness = Number(result.analysis?.overallReadiness);

      setReadiness(
        Number.isFinite(overallReadiness)
          ? Math.max(0, Math.min(100, Math.round(overallReadiness)))
          : 0
      );
    };

    loadCareerReadiness();
  }, [user?.id, selectedCareerId]);

  return (
    <Layout>
      <div className="mb-9">
        <p className="type-eyebrow">Your momentum</p>
        <h1 className="mt-2 type-page-title">Progress dashboard</h1>
        <p className="mt-3 type-body">
          Track how ready you are for your target career.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="flex flex-col items-center justify-center gap-4 text-center"
          elevated
        >
          <MatchRing
            value={readiness}
            size={110}
            strokeWidth={8}
          />

          <div>
            <p className="font-heading text-xl font-bold text-dark-green">
              Career readiness
            </p>

            <p className="mt-1 type-supporting">
              You&apos;re making steady progress.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <div className="mb-3 flex items-center gap-2 text-dark-green">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-light-sage">
                  <stat.icon
                    size={16}
                    aria-hidden="true"
                  />
                </span>

                <p className="text-sm font-semibold">
                  {stat.label}
                </p>
              </div>

              {stat.isCount ? (
                <p className="font-heading text-2xl font-bold text-dark-green">
                  {stat.value}
                  <span className="ml-1 text-sm font-medium text-text-muted">
                    {stat.suffix}
                  </span>
                </p>
              ) : (
                <>
                  <ProgressBar
                    value={stat.value}
                    label={`${stat.label} progress`}
                  />

                  <p className="mt-2 text-right text-sm font-semibold text-dark-green">
                    {stat.value}%
                  </p>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-sage bg-light-sage/50">
        <h2 className="font-heading text-xl font-bold text-dark-green">
          {roadmapProgress === 100 ? "Great work!" : "Keep going"}
        </h2>

        <p className="mt-2 type-supporting text-text-dark">
          {roadmapProgress === 100
            ? "You have completed your career roadmap. Keep building your skills and applying what you have learned."
            : "Complete your roadmap and continue improving your skills to build your career readiness."}
        </p>
      </Card>
    </Layout>
  );
}
