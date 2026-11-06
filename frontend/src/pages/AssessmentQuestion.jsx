import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import { questions, options } from "../data/questions";
import { useAssessment } from "../context/AssessmentContext";
import { useAuth } from "../context/AuthContext";
import { assessmentApi } from "../services/api";

export default function AssessmentQuestion() {
  const navigate = useNavigate();
  const { answers, answerQuestion, finishAssessment } = useAssessment();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const question = questions[index];
  const selected = answers[question.id];
  const isLast = index === questions.length - 1;

  const handleNext = async () => {
    if (isLast) {
      setError("");
      setSubmitting(true);
      try {
        const response = await assessmentApi.submit(answers, user?.id);
        if (!response.success) {
          setError(response.message);
          return;
        }
        finishAssessment();
        navigate("/assessment/result");
      } catch {
        setError("We could not submit your assessment. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (index === 0) {
      navigate("/assessment");
      return;
    }
    setIndex((i) => i - 1);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="mb-3 flex justify-between text-sm font-semibold text-text-muted">
            <span>Question {index + 1} of {questions.length}</span>
            <span>{Math.round(((index + 1) / questions.length) * 100)}% complete</span>
          </div>
          <ProgressBar value={index + 1} max={questions.length} label="Assessment progress" />
        </div>

        <Card className="mb-7 flex min-h-[190px] items-center justify-center px-6 py-10 text-center sm:px-12 lg:min-h-[220px]" elevated>
          <h1 className="max-w-3xl font-heading text-2xl font-semibold leading-snug text-dark-green sm:text-3xl lg:text-4xl">“{question.text}”</h1>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Assessment response options">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected === opt.value}
              onClick={() => answerQuestion(question.id, opt.value)}
              className={`focus-ring min-h-16 rounded-xl border px-5 py-4 text-left text-base font-medium leading-6 transition-colors ${selected === opt.value ? "border-dark-green bg-light-sage text-dark-green shadow-card" : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <Button variant="outline" size="lg" icon={ChevronLeft} onClick={handlePrev}>Previous</Button>
          <Button variant="primary" size="lg" fullWidth icon={ChevronRight} iconPosition="right" onClick={handleNext} disabled={selected === undefined} loading={submitting}>
            {isLast ? "Submit assessment" : "Next question"}
          </Button>
        </div>
        {error && <p className="mt-4 text-sm font-medium text-coral" role="alert">{error}</p>}
      </div>
    </Layout>
  );
}
