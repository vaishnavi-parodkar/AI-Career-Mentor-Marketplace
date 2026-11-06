import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import ProgressBar from "../components/ProgressBar";
import { useAssessment } from "../context/AssessmentContext";
import { useAuth } from "../context/AuthContext";
import { skillAssessmentApi } from "../services/api";

export default function SkillAssessment() {
  const { careerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSelectedCareerId } = useAssessment();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const browseMode = searchParams.get("mode") === "browse";
  const question = questions[index];
  const selected = question ? answers[question.id] : undefined;
  const isLast = index === questions.length - 1;

  useEffect(() => {
    setSelectedCareerId(careerId);

    const loadQuestions = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await skillAssessmentApi.getQuestions(careerId);
        if (!response.success) {
          setError(response.message);
        } else {
          setQuestions(response.questions);
        }
      } catch {
        setError("We could not load this skill assessment right now.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [careerId, setSelectedCareerId]);

  const handleNext = async () => {
    if (selected === undefined) return;

    if (!isLast) {
      setIndex((currentIndex) => currentIndex + 1);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await skillAssessmentApi.submit({
        userId: user?.id,
        careerId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId: Number(questionId),
          value,
        })),
      });
      if (!response.success) {
        setError(response.message);
        return;
      }
      setSelectedCareerId(careerId);
      navigate(`/careers/${careerId}${browseMode ? "?mode=browse" : ""}`);
    } catch {
      setError("We could not submit your skill assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (index === 0) {
      navigate(`/careers/${careerId}${browseMode ? "?mode=browse" : ""}`);
      return;
    }
    setIndex((currentIndex) => currentIndex - 1);
  };

  if (loading) {
    return (
      <Layout>
        <Loader label="Loading skill assessment..." />
      </Layout>
    );
  }

  if (error && questions.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl">
          <BackButton to={`/careers/${careerId}${browseMode ? "?mode=browse" : ""}`} />
          <p className="mt-6 text-center text-sm text-coral">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout>
        <p className="text-center text-sm text-text-muted">No skill assessment questions are available for this career.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <BackButton to={`/careers/${careerId}${browseMode ? "?mode=browse" : ""}`} />
          <p className="mt-6 type-eyebrow">Career-specific skill assessment</p>
          <div className="mb-3 mt-3 flex justify-between text-sm font-semibold text-text-muted">
            <span>Question {index + 1} of {questions.length}</span>
            <span>{Math.round(((index + 1) / questions.length) * 100)}% complete</span>
          </div>
          <ProgressBar value={index + 1} max={questions.length} />
        </div>

        <Card className="mb-6" elevated>
          <p className="type-eyebrow mb-3">
            {question.skillName}
          </p>
          <h1 className="font-heading text-2xl font-bold text-dark-green sm:text-3xl">
            {question.question}
          </h1>
          <p className="mt-4 type-supporting">Choose the option that best reflects your current experience. There are no right answers—your responses shape your readiness view for this career.</p>
        </Card>

        <div className="flex flex-col gap-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected === option.value}
              onClick={() => setAnswers((currentAnswers) => ({
                ...currentAnswers,
                [question.id]: option.value,
              }))}
              className={`focus-ring flex min-h-12 items-center gap-4 rounded-xl border px-5 py-4 text-left text-base font-medium transition-colors ${
                selected === option.value
                  ? "border-dark-green bg-light-sage text-dark-green"
                  : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${selected === option.value ? "bg-dark-green text-off-white" : "bg-cream text-text-muted"}`}>{option.value}</span>
              {option.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-coral">{error}</p>}

        <div className="mt-8 flex gap-3">
          <Button variant="outline" size="lg" icon={ChevronLeft} onClick={handlePrevious}>
            Previous
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={ChevronRight}
            iconPosition="right"
            onClick={handleNext}
            disabled={selected === undefined}
            loading={submitting}
          >
            {isLast ? "Submit assessment" : "Next question"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
