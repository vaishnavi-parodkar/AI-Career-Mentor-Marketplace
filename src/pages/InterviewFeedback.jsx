import { useNavigate, useSearchParams } from "react-router-dom";
import { Award, ThumbsUp, AlertTriangle, MessageSquare, Cpu, ArrowRight, Mic, Sparkles, ChevronDown } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import MatchRing from "../components/MatchRing";
import ProgressBar from "../components/ProgressBar";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { interviewApi } from "../services/interviewApi";

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

export default function InterviewFeedback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const history = interviewApi.getHistory(user?.id);
  const feedback = interviewApi.getResult(user?.id, searchParams.get("id"));

  if (!feedback) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={Mic}
            title="No interview results yet"
            description="Complete a mock interview and your feedback will show up here."
            action={<Button variant="primary" onClick={() => navigate("/mock-interview")}>Start a mock interview</Button>}
          />
        </div>
      </Layout>
    );
  }

  const others = history.filter((item) => item.id !== feedback.id).slice(0, 5);

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-light-sage text-dark-green">
            <Award size={30} aria-hidden="true" />
          </div>
          <p className="type-eyebrow">Practice review</p>
          <h1 className="mt-2 type-page-title">Interview feedback</h1>
          <p className="mt-3 type-supporting">
            {feedback.careerTitle} · {formatDate(feedback.createdAt)}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 type-meta">
            <Sparkles size={12} aria-hidden="true" />
            {feedback.source === "ai"
              ? "AI-generated feedback"
              : "Offline estimate based on answer structure and keywords. It can't check factual accuracy."}
          </p>
          {feedback.meta?.timed && (
            <p className="mt-2 type-meta">
              Timed round · {Math.round(feedback.meta.secondsPerQuestion / 60)} min per question
              {feedback.meta.timedOut ? ` · ${feedback.meta.timedOut} ran out of time` : ""}
              {feedback.meta.violations ? ` · ${feedback.meta.violations} focus ${feedback.meta.violations === 1 ? "warning" : "warnings"}` : ""}
              {feedback.meta.endedBy === "violations" ? " · ended after too many warnings" : feedback.meta.endedBy === "manual" ? " · ended early" : ""}
            </p>
          )}
        </div>

        <Card className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between" elevated>
          <div className="flex items-center gap-4">
            <MatchRing value={feedback.overall} size={80} />
            <div>
              <p className="type-meta">Overall score</p>
              <p className="font-heading text-xl font-bold text-dark-green">{feedback.summary}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/mock-interview")}>Retake interview</Button>
        </Card>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center gap-2 text-dark-green">
              <MessageSquare size={17} aria-hidden="true" />
              <p className="text-base font-semibold">Communication</p>
            </div>
            <ProgressBar value={feedback.communication} label="Communication score" />
            <p className="mt-2 text-right text-sm font-semibold text-dark-green">{feedback.communication}%</p>
          </Card>
          <Card>
            <div className="mb-3 flex items-center gap-2 text-dark-green">
              <Cpu size={17} aria-hidden="true" />
              <p className="text-base font-semibold">Technical knowledge</p>
            </div>
            <ProgressBar value={feedback.technical} label="Technical knowledge score" />
            <p className="mt-2 text-right text-sm font-semibold text-dark-green">{feedback.technical}%</p>
          </Card>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center gap-2 text-green">
              <ThumbsUp size={17} aria-hidden="true" />
              <p className="text-base font-semibold text-dark-green">Strengths</p>
            </div>
            <ul className="flex flex-col gap-2 text-base leading-7 text-text-dark">
              {feedback.strengths.map((s) => <li key={s}>• {s}</li>)}
            </ul>
          </Card>
          <Card>
            <div className="mb-3 flex items-center gap-2 text-coral">
              <AlertTriangle size={17} aria-hidden="true" />
              <p className="text-base font-semibold text-dark-green">Areas to improve</p>
            </div>
            <ul className="flex flex-col gap-2 text-base leading-7 text-text-dark">
              {feedback.weaknesses.map((w) => <li key={w}>• {w}</li>)}
            </ul>
          </Card>
        </div>

        <Card className="mb-6">
          <h2 className="mb-3 font-heading text-xl font-bold text-dark-green">Recommendations</h2>
          <ul className="flex flex-col gap-3 text-base leading-7 text-text-dark">
            {feedback.recommendations.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                {r}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="mb-3 font-heading text-xl font-bold text-dark-green">Question by question</h2>
          <div className="flex flex-col gap-2">
            {feedback.questions.map((q, i) => (
              <details key={q.id || i} className="group rounded-xl border border-border bg-cream/50 px-4 py-3">
                <summary className="focus-ring flex min-h-8 cursor-pointer list-none items-start justify-between gap-3">
                  <span className="text-sm font-semibold leading-6 text-dark-green">{i + 1}. {q.question}</span>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-dark-green">
                    {q.skipped ? "Skipped" : `${q.score}%`}
                    <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden="true" />
                  </span>
                </summary>
                {!q.skipped && q.answer && (
                  <div className="mt-3">
                    <p className="type-meta">Your answer</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-text-muted">{q.answer}</p>
                  </div>
                )}
                <ul className="mt-3 flex flex-col gap-1.5 text-sm leading-6 text-text-dark">
                  {q.feedback.map((note) => <li key={note}>• {note}</li>)}
                </ul>
              </details>
            ))}
          </div>
        </Card>

        {others.length > 0 && (
          <Card className="mb-6">
            <h2 className="mb-3 font-heading text-xl font-bold text-dark-green">Previous attempts</h2>
            <ul className="flex flex-col gap-2">
              {others.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/interview-feedback?id=${item.id}`)}
                    className="focus-ring flex min-h-11 w-full items-center justify-between rounded-xl border border-border px-4 py-2 text-left text-sm hover:bg-light-sage/60"
                  >
                    <span className="font-semibold text-dark-green">{item.careerTitle}</span>
                    <span className="text-text-muted">{formatDate(item.createdAt)} · {item.overall}%</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Button variant="primary" size="lg" fullWidth icon={ArrowRight} iconPosition="right" onClick={() => navigate("/progress")}>
          View progress dashboard
        </Button>
      </div>
    </Layout>
  );
}
