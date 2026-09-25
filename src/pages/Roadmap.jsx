import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { roadmapApi, careerApi } from "../services/api";
import { useAssessment } from "../context/AssessmentContext";
import { useAuth } from "../context/AuthContext";

export default function Roadmap() {
  const navigate = useNavigate();
  const { selectedCareerId } = useAssessment();
  console.log("Selected Career ID:", selectedCareerId);
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(Boolean(selectedCareerId));
  const [error, setError] = useState("");

  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [updatingStepId, setUpdatingStepId] = useState(null);

  const handleStepCompletion = async (stepId, completed) => {
    setUpdatingStepId(stepId);

    try {
      const response = await roadmapApi.completeStep(stepId, completed);

      if (!response.success) {
        throw new Error(response.message);
      }

      setRoadmap((currentRoadmap) => {
        if (!currentRoadmap) return currentRoadmap;

        return {
          ...currentRoadmap,
          steps: currentRoadmap.steps.map((step) =>
            step.id === stepId
              ? { ...step, completed }
              : step
          ),
        };
      });
    } catch (requestError) {
      setError(
        requestError.message || "Unable to update roadmap progress."
      );
    } finally {
      setUpdatingStepId(null);
    }
  };

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

  useEffect(() => {
    let active = true;

    if (!user?.id) return undefined;

    const loadRoadmap = async () => {
      setRoadmapLoading(true);

      try {
        const response = await roadmapApi.getByUser(user.id);

        if (!response.success) {
          throw new Error(response.message);
        }

        if (active) {
          const roadmaps = Array.isArray(response.roadmaps)
            ? response.roadmaps
            : [];

          const matchingRoadmaps = selectedCareerId
            ? roadmaps.filter(
                (item) => item.career?.careerId === selectedCareerId
              )
            : roadmaps;

          const latestRoadmap = matchingRoadmaps.reduce(
            (latest, current) =>
              !latest || current.id > latest.id ? current : latest,
            null
          );

          setRoadmap(latestRoadmap);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message || "Unable to load your career roadmap."
          );
        }
      } finally {
        if (active) {
          setRoadmapLoading(false);
        }
      }
    };

    loadRoadmap();

    return () => {
      active = false;
    };
  }, [user?.id, selectedCareerId]);

  if (loading) return <Layout><p className="py-16 text-center type-supporting">Loading roadmap context...</p></Layout>;
  if (!selectedCareerId || !career) return <Layout><Card className="mx-auto max-w-xl text-center" elevated><p className="type-eyebrow">Your next step</p><h1 className="mt-2 type-section-title">Suggested career roadmap</h1><p className="mt-3 type-supporting">{error || "Select a career to view its suggested roadmap."}</p><Button className="mt-6" variant="primary" onClick={() => navigate("/careers")}>View career recommendations</Button></Card></Layout>;

  return (
    <Layout>
      <div className="mb-9">
        <p className="type-eyebrow">Keep moving</p>

        <h1 className="mt-2 type-page-title">
          Personalized career roadmap
        </h1>

        <p className="mt-3 max-w-2xl type-body">
          A personalized sequence for becoming job-ready in{" "}
          <span className="font-semibold text-dark-green">
            {career.title}
          </span>
          .
        </p>
      </div>

      <div className="relative mx-auto max-w-2xl">
        {roadmapLoading ? (
          <Card elevated>
            <div className="p-6 text-center">
              <p className="type-supporting">
                Loading your personalized roadmap...
              </p>
            </div>
          </Card>
        ) : roadmap?.steps?.length > 0 ? (
          roadmap.steps.map((step, index) => {
            const isLast = index === roadmap.steps.length - 1;

            return (
              <div
                key={step.id || index}
                className="relative flex gap-5 pb-9"
              >
                {!isLast && (
                  <div className="absolute left-[19px] top-10 h-full w-0.5 bg-border" />
                )}

                <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark-green text-off-white">
                  <span className="font-heading text-lg font-bold">
                    {index + 1}
                  </span>
                </div>

                <Card className="flex-1" elevated>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3
                        className={`font-heading text-xl font-bold ${
                          step.completed
                            ? "text-text-muted line-through"
                            : "text-dark-green"
                        }`}
                      >
                        {step.title}
                      </h3>

                      <span className="type-meta text-text-muted">
                        Step {index + 1}
                      </span>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-semibold text-dark-green">
                      <input
                        type="checkbox"
                        checked={Boolean(step.completed)}
                        disabled={updatingStepId === step.id}
                        onChange={(event) =>
                          handleStepCompletion(step.id, event.target.checked)
                        }
                        className="h-4 w-4 accent-dark-green"
                      />
                      {step.completed ? "Completed" : "Mark complete"}
                    </label>
                  </div>

                  <p className="type-supporting">
                    {step.description}
                  </p>

                  {step.recommendations && (
                    <div className="mt-4 rounded-xl bg-[#fbf9f2] p-4">
                      <p className="mb-2 text-xs font-semibold text-[#162c29]">
                        Recommended Actions
                      </p>

                      <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                        {step.recommendations}
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            );
          })
        ) : (
          <Card elevated>
            <div className="p-6 text-center">
              <p className="type-supporting">
                No personalized roadmap has been generated yet.
              </p>

              <Button
                className="mt-5"
                variant="primary"
                onClick={() => navigate("/skill-gap")}
              >
                Go to Skill Gap
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="mx-auto mt-2 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => navigate("/skill-gap")}
        >
          View skill gaps
        </Button>
      </div>
    </Layout>
  );
        
}
