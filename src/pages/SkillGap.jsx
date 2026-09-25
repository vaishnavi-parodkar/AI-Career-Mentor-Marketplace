import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  AlertCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";

import { useAssessment } from "../context/AssessmentContext";
import { useAuth } from "../context/AuthContext";
import { careerApi, skillAssessmentApi, roadmapApi } from "../services/api";

/*
 * Default skills shown in the UI.
 *
 * These are used when the backend does not return skill scores.
 * You can change these values later without changing the rest
 * of the component.
 */
const DEFAULT_SKILLS = [
  {
    id: "javascript",
    name: "JavaScript",
    value: 45,
  },
  {
    id: "java",
    name: "Java",
    value: 15,
  },
  {
    id: "react",
    name: "React",
    value: 70,
  },
  {
    id: "data-structures",
    name: "Data Structures",
    value: 50,
  },
  {
    id: "system-design",
    name: "System Design",
    value: 20,
  },
];

export default function SkillGap() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { selectedCareerId } = useAssessment();

  const [career, setCareer] = useState(null);

  const [skillGap, setSkillGap] = useState(null);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [resumeContext, setResumeContext] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [error, setError] = useState("");

  const hasBackendUser =
      Number.isInteger(user?.id) && user.id > 0;

  /*
   * Load career + existing skill gap data.
   */
  const load = useCallback(async () => {
    if (!selectedCareerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [careerDetails, gapResponse] = await Promise.all([
        careerApi.getById(selectedCareerId),

        hasBackendUser
            ? skillAssessmentApi.getSkillGap(
                user.id,
                selectedCareerId
            )
            : Promise.resolve({
              success: false,
            }),
      ]);

      setCareer(careerDetails);

      if (gapResponse?.success) {
        setSkillGap(gapResponse);

        /*
         * If backend already has skill information,
         * convert the 0-5 score into the 0-100 percentage
         * used by the reference UI.
         */
        if (
            Array.isArray(gapResponse.skills) &&
            gapResponse.skills.length > 0
        ) {
          const backendSkills = gapResponse.skills.map(
              (skill, index) => {
                const score = Number(skill.userScore);

                let percentage = 0;

                if (Number.isFinite(score)) {
                  percentage = Math.round((score / 5) * 100);
                }

                return {
                  id:
                      skill.skillId ??
                      skill.id ??
                      `skill-${index}`,
                  name:
                      skill.skillName ??
                      skill.name ??
                      `Skill ${index + 1}`,
                  value: Math.max(
                      0,
                      Math.min(100, percentage)
                  ),
                };
              }
          );

          setSkills(backendSkills);
        }
      }
    } catch (e) {
      setError(
          e.message ||
          "Could not load your skill gap analysis."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCareerId, hasBackendUser, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  /*
   * Change one slider value.
   */
  const handleSkillChange = (id, value) => {
    setSkills((currentSkills) =>
        currentSkills.map((skill) =>
            skill.id === id
                ? {
                  ...skill,
                  value: Number(value),
                }
                : skill
        )
    );
  };

  /*
   * Analyze button.
   *
   * At the moment this keeps the existing skill-gap API flow.
   * If your backend has a separate "analyze" endpoint,
   * this is the place where we can connect it.
   */
  const handleAnalyze = async () => {
    if (!hasBackendUser) {
      setError("Please log in with a valid account before analyzing your skill gap.");
      return;
    }

    if (!selectedCareerId) {
      setError("Please select a career before analyzing your skill gap.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await skillAssessmentApi.analyzeSkillGap({
        userId: user.id,
        careerId: selectedCareerId,
        skills,
        resumeContext,
      });

      if (!result.success) {
        throw new Error(
            result.message || "Could not analyze your skill gap."
        );
      }

      setAnalysis(result.analysis);
    } catch (e) {
      setError(
          e.message ||
          "Could not analyze your skill gap."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!hasBackendUser) {
      setError("A valid backend user ID is required to generate a roadmap.");
      return;
    }

    if (!selectedCareerId) {
      setError("A career is required to generate a roadmap.");
      return;
    }

    setGeneratingRoadmap(true);
    setError("");

    try {
      const response = await roadmapApi.generate({
        userId: user.id,
        careerId: selectedCareerId,
        skills,
        resumeContext,
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      navigate("/roadmap");
    } catch (requestError) {
      setError(
        requestError.message || "Unable to generate your career roadmap."
      );
    } finally {
      setGeneratingRoadmap(false);
    }
  };
  /*
   * No career selected.
   */
  if (!selectedCareerId) {
    return (
        <Layout>
          <div className="mx-auto max-w-[980px] py-8">
            <Card className="text-center">
              <h1 className="mb-2 font-heading text-2xl font-bold text-dark-green">
                Choose a target career first
              </h1>

              <p className="mb-6 text-sm text-text-muted">
                Skill Gap Analysis compares your current
                skills with the requirements of your selected
                career.
              </p>

              <Button
                  variant="primary"
                  onClick={() => navigate("/careers")}
              >
                Choose Career
              </Button>
            </Card>
          </div>
        </Layout>
    );
  }

  /*
   * Loading state.
   */
  if (loading) {
    return (
        <Layout>
          <Loader label="Loading your skill gap..." />
        </Layout>
    );
  }

  /*
   * Career could not be loaded.
   */
  if (!career) {
    return (
        <Layout>
          <div className="mx-auto max-w-[980px] py-8">
            <Card>
              <p className="text-sm text-coral">
                {error || "Career not found."}
              </p>
            </Card>
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <main className="mx-auto w-full max-w-[980px] px-4 pb-12 pt-5 sm:px-6 lg:px-0">

          {/* =====================================================
            HEADER
        ====================================================== */}

          <div className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="font-heading text-[28px] font-bold leading-tight text-dark-green sm:text-[32px]">
                Skill Gap Analysis
              </h1>

              <p className="mt-0.5 text-sm text-text-muted">
                Based on your target career:{" "}
                <span className="font-semibold text-dark-green">
                {career.title}
              </span>
              </p>

              {/* Analysis source badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e8f1df] px-3 py-1 text-[11px] font-medium text-dark-green">
                <Sparkles size={13} />
                <span>
  Analysis source: {analysis ? "Groq AI" : "Rule-based assessment"}
</span>
              </div>
            </div>

            {/* Refresh button */}
            <button
                type="button"
                onClick={load}
                disabled={loading}
                className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              self-start
              rounded-full
              border
              border-dark-green
              bg-transparent
              px-5
              text-sm
              font-semibold
              text-dark-green
              transition
              hover:bg-dark-green
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:self-auto
            "
            >
              <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
              />

              Refresh Analysis
            </button>
          </div>

          {/* =====================================================
            ERROR
        ====================================================== */}

          {error && (
              <div
                  className="
              mb-4
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-[#f2cabb]
              bg-[#fff5ef]
              px-4
              py-3
              text-sm
              text-[#e77965]
            "
              >
                <AlertCircle
                    size={17}
                    className="shrink-0"
                />

                <span>{error}</span>
              </div>
          )}

          {/* =====================================================
            MAIN CARD
        ====================================================== */}

          <section
              className="
            rounded-[20px]
            border
            border-[#e5dfd0]
            bg-[#fffdf8]
            p-4
            shadow-[0_3px_12px_rgba(50,70,50,0.07)]
            sm:p-5
          "
          >

            {/* Card heading */}
            <div className="mb-4">
              <h2 className="font-heading text-lg font-bold text-dark-green">
                Your Current Skill Levels
              </h2>

              <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
                Set your real proficiency. These values are
                saved for your account/browser and sent to
                the backend.
              </p>
            </div>

            {/* =================================================
              SKILL GRID
          ================================================== */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {skills.map((skill) => (
                  <div
                      key={skill.id}
                      className="
                  rounded-xl
                  border
                  border-[#e3ddcf]
                  bg-[#fbf9f2]
                  px-4
                  py-4
                "
                  >
                    {/* Skill name + percentage */}
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label
                          htmlFor={`skill-${skill.id}`}
                          className="text-sm font-semibold text-[#162c29]"
                      >
                        {skill.name}
                      </label>

                      <span className="text-sm font-bold text-dark-green">
                    {skill.value}%
                  </span>
                    </div>

                    {/* Slider */}
                    <input
                        id={`skill-${skill.id}`}
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={skill.value}
                        onChange={(e) =>
                            handleSkillChange(
                                skill.id,
                                e.target.value
                            )
                        }
                        className="
                    skill-slider
                    w-full
                    cursor-pointer
                  "
                        style={{
                          "--progress": `${skill.value}%`,
                        }}
                    />
                  </div>
              ))}
            </div>

            {/* =================================================
              RESUME / PROFILE CONTEXT
          ================================================== */}

            <div className="mt-4">
              <label
                  htmlFor="resume-context"
                  className="mb-1.5 block text-sm font-semibold text-[#162c29]"
              >
                Optional resume / profile context
              </label>

              <textarea
                  id="resume-context"
                  value={resumeContext}
                  onChange={(e) =>
                      setResumeContext(e.target.value)
                  }
                  placeholder="Paste a short resume summary, projects, experience or LinkedIn About section. Groq can use this to infer additional skills."
                  className="
                min-h-[86px]
                w-full
                resize-y
                rounded-xl
                border
                border-[#e3ddcf]
                bg-[#fffdf8]
                px-4
                py-3
                text-sm
                text-[#162c29]
                outline-none
                transition
                placeholder:text-[#aeb2c0]
                focus:border-dark-green
                focus:ring-2
                focus:ring-dark-green/10
              "
              />
            </div>

            {/* =================================================
              ANALYZE BUTTON
          ================================================== */}

            <div className="mt-5">
              <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-full
                bg-dark-green
                px-5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:-translate-y-[1px]
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
              >
                <Sparkles
                    size={16}
                    className={
                      analyzing
                          ? "animate-pulse"
                          : ""
                    }
                />

                {analyzing
                    ? "Analyzing..."
                    : "Analyze My Skill Gap"}
              </button>
            </div>
          </section>

          {/* =====================================================
            AI ANALYSIS RESULT
          ====================================================== */}

          {analysis && (
              <div className="mt-6 space-y-5">

                {/* Overall readiness + summary */}
                <Card>
                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <Sparkles
                              size={18}
                              className="text-dark-green"
                          />

                          <h2 className="font-heading text-xl font-bold text-dark-green">
                            AI Skill Gap Analysis
                          </h2>
                        </div>

                        <p className="text-sm text-text-muted">
                          {analysis.career}
                        </p>
                      </div>

                      {/* Overall readiness */}
                      <div className="rounded-xl bg-[#e8f1df] px-5 py-3 text-center">
                        <p className="text-[11px] font-medium text-text-muted">
                          Overall Readiness
                        </p>

                        <p className="text-3xl font-bold text-dark-green">
                          {analysis.overallReadiness}%
                        </p>
                      </div>

                    </div>

                    {/* Summary */}
                    {analysis.summary && (
                        <div className="mt-5 rounded-xl bg-[#fbf9f2] p-4">
                          <p className="text-sm leading-relaxed text-[#162c29]">
                            {analysis.summary}
                          </p>
                        </div>
                    )}

                  </div>
                </Card>

                {/* Skill-by-skill analysis */}
                {Array.isArray(analysis.skills) &&
                    analysis.skills.length > 0 && (
                        <Card>
                          <div className="p-5 sm:p-6">

                            <h2 className="mb-5 font-heading text-xl font-bold text-dark-green">
                              Skill Analysis
                            </h2>

                            <div className="space-y-5">

                              {analysis.skills.map((skill, index) => (
                                  <div
                                      key={`${skill.skillName}-${index}`}
                                      className="
                              rounded-xl
                              border
                              border-[#e3ddcf]
                              bg-[#fbf9f2]
                              p-4
                            "
                                  >

                                    {/* Skill header */}
                                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                      <h3 className="text-sm font-bold text-[#162c29]">
                                        {skill.skillName}
                                      </h3>

                                      {skill.priority && (
                                          <span className="w-fit rounded-full bg-[#fff0e9] px-3 py-1 text-[11px] font-semibold text-[#d96f58]">
                                  {skill.priority}
                                </span>
                                      )}

                                    </div>

                                    {/* Current / Required / Gap */}
                                    <div className="mb-4 grid grid-cols-3 gap-3">

                                      <div>
                                        <p className="text-[11px] text-text-muted">
                                          Current
                                        </p>

                                        <p className="text-base font-bold text-dark-green">
                                          {skill.currentLevel}%
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-[11px] text-text-muted">
                                          Required
                                        </p>

                                        <p className="text-base font-bold text-dark-green">
                                          {skill.requiredLevel}%
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-[11px] text-text-muted">
                                          Gap
                                        </p>

                                        <p className="text-base font-bold text-[#d96f58]">
                                          {skill.gap}%
                                        </p>
                                      </div>

                                    </div>

                                    {/* Reason */}
                                    {skill.reason && (
                                        <div className="mb-4">
                                          <p className="mb-1 text-xs font-semibold text-[#162c29]">
                                            Why this matters
                                          </p>

                                          <p className="text-sm leading-relaxed text-text-muted">
                                            {skill.reason}
                                          </p>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {Array.isArray(skill.recommendations) &&
                                        skill.recommendations.length > 0 && (
                                            <div>
                                              <p className="mb-2 text-xs font-semibold text-[#162c29]">
                                                Recommendations
                                              </p>

                                              <ul className="space-y-1.5 pl-5 text-sm text-text-muted">
                                                {skill.recommendations.map(
                                                    (recommendation, recommendationIndex) => (
                                                        <li
                                                            key={recommendationIndex}
                                                            className="list-disc"
                                                        >
                                                          {recommendation}
                                                        </li>
                                                    )
                                                )}
                                              </ul>
                                            </div>
                                        )}

                                  </div>
                              ))}

                            </div>
                          </div>
                        </Card>
                    )}

                {/* Next steps */}
                {Array.isArray(analysis.nextSteps) &&
                    analysis.nextSteps.length > 0 && (
                        <Card>
                          <div className="p-5 sm:p-6">

                            <h2 className="mb-4 font-heading text-xl font-bold text-dark-green">
                              Recommended Next Steps
                            </h2>

                            <ol className="space-y-3 pl-5 text-sm leading-relaxed text-[#162c29]">
                              {analysis.nextSteps.map((step, index) => (
                                  <li
                                      key={index}
                                      className="list-decimal"
                                  >
                                    {step}
                                  </li>
                              ))}
                            </ol>

                          </div>
                        </Card>
                    )}

                    {/* Generate Career Roadmap */}
                      <div className="flex justify-center pt-2 pb-4">
                        <button
                          type="button"
                          onClick={handleGenerateRoadmap}
                          disabled={generatingRoadmap}
                          className="
                            inline-flex
                            h-12
                            items-center
                            justify-center
                            gap-2
                            rounded-full
                            bg-dark-green
                            px-7
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:-translate-y-[1px]
                            hover:shadow-md
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {generatingRoadmap
                            ? "Generating Roadmap..."
                            : "Generate My Career Roadmap"}
                          </button>
                        </div>

              </div>
        )}

        </main>

        {/* =====================================================
          SLIDER CSS
      ====================================================== */}
        <style>{`
        .skill-slider {
          appearance: none;
          -webkit-appearance: none;
          height: 5px;
          border-radius: 999px;
          outline: none;
          background:
            linear-gradient(
              to right,
              #075747 0%,
              #075747 var(--progress),
              #d9d9d9 var(--progress),
              #d9d9d9 100%
            );
        }

        .skill-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          border: none;
          background: #075747;
          cursor: pointer;
        }

        .skill-slider::-moz-range-thumb {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          border: none;
          background: #075747;
          cursor: pointer;
        }

        .skill-slider:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(7, 87, 71, 0.14);
        }

        .skill-slider:focus-visible::-moz-range-thumb {
          box-shadow: 0 0 0 4px rgba(7, 87, 71, 0.14);
        }
      `}</style>
      </Layout>
  );
}