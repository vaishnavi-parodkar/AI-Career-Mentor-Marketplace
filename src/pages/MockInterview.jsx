import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, ArrowRight, SkipForward, Lightbulb, Sparkles, History, Timer, Maximize, ShieldAlert, XCircle } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useAssessment } from "../context/AssessmentContext";
import { interviewApi } from "../services/interviewApi";
import { enterFullscreen, exitFullscreen, isFullscreen, isFullscreenSupported, onFullscreenChange } from "../utils/fullscreen";
import {
  interviewCareers,
  INTERVIEW_CATEGORIES,
  DEFAULT_QUESTIONS,
} from "../data/interviewBank";

const COUNT_OPTIONS = [3, 5, 7, 10];
const TIME_OPTIONS = [1, 2, 3, 5]; // minutes per question
const DEFAULT_MINUTES = 2;
const MAX_VIOLATIONS = 3; // leaving fullscreen or switching tabs this many times ends the interview
const WARN_AT_SECONDS = 20;

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export default function MockInterview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCareerId } = useAssessment();

  const defaultCareer = interviewCareers.some((c) => c.id === selectedCareerId)
    ? selectedCareerId
    : interviewCareers[0].id;

  const [stage, setStage] = useState("setup"); // setup | interview | scoring
  const [careerId, setCareerId] = useState(defaultCareer);
  const [count, setCount] = useState(DEFAULT_QUESTIONS);
  const [starting, setStarting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [source, setSource] = useState("bank");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [startError, setStartError] = useState("");
  const [remaining, setRemaining] = useState(DEFAULT_MINUTES * 60);
  const [violations, setViolations] = useState(0);
  const [outOfFullscreen, setOutOfFullscreen] = useState(false);
  const [flash, setFlash] = useState("");
  const [confirmEnd, setConfirmEnd] = useState(false);

  const fullscreenSupported = isFullscreenSupported();
  const answersRef = useRef({});
  const deadlineRef = useRef(0);
  const finishedRef = useRef(false);
  const violationsRef = useRef(0);
  const timedOutRef = useRef(0);
  const lastViolationAt = useRef(0);
  const timeUpRef = useRef(() => {});
  answersRef.current = answers;

  const hasHistory = interviewApi.getHistory(user?.id).length > 0;
  const career = interviewCareers.find((c) => c.id === careerId);

  const handleStart = async () => {
    setStartError("");
    // Fullscreen has to be requested straight from the click, before any await.
    if (fullscreenSupported) {
      const ok = await enterFullscreen();
      if (!ok) {
        setStartError("Fullscreen is required for the interview. Please allow it and press Start again.");
        return;
      }
    }
    setStarting(true);
    const result = await interviewApi.getQuestions({ careerId, count });
    setQuestions(result.questions);
    setSource(result.source);
    setAnswers({});
    setIndex(0);
    setViolations(0);
    violationsRef.current = 0;
    timedOutRef.current = 0;
    finishedRef.current = false;
    setOutOfFullscreen(false);
    setConfirmEnd(false);
    setStarting(false);
    setStage("interview");
  };

  const finish = useCallback(async (finalAnswers, endedBy = "completed") => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStage("scoring");
    await exitFullscreen();
    const result = await interviewApi.evaluate({ careerId, questions, answers: finalAnswers });
    const meta = { timed: true, secondsPerQuestion: minutes * 60, violations: violationsRef.current, timedOut: timedOutRef.current, endedBy };
    const saved = interviewApi.saveResult(user?.id, { ...result, meta });
    navigate(`/interview-feedback?id=${saved.id}`);
  }, [careerId, questions, minutes, user?.id, navigate]);

  const flashMessage = (text) => {
    setFlash(text);
    window.setTimeout(() => setFlash((current) => (current === text ? "" : current)), 3500);
  };

  const registerViolation = useCallback((message) => {
    const now = Date.now();
    if (now - lastViolationAt.current < 1000) return; // one event can fire several signals
    lastViolationAt.current = now;
    violationsRef.current += 1;
    setViolations(violationsRef.current);
    if (violationsRef.current >= MAX_VIOLATIONS) {
      finish(answersRef.current, "violations");
      return;
    }
    flashMessage(message);
  }, [finish]);

  // Moving on (Next, Skip, or the clock running out). Forward-only: a timed round has no going back.
  const advance = useCallback((timedOut = false) => {
    if (timedOut) timedOutRef.current += 1;
    if (index >= questions.length - 1) { finish(answersRef.current, timedOut ? "time" : "completed"); return; }
    setIndex((i) => i + 1);
  }, [index, questions.length, finish]);

  timeUpRef.current = () => {
    flashMessage("Time's up for that question. Moving on.");
    advance(true);
  };

  // Per-question countdown, driven by a deadline so background throttling can't stretch it.
  useEffect(() => {
    if (stage !== "interview") return undefined;
    deadlineRef.current = Date.now() + minutes * 60 * 1000;
    setRemaining(minutes * 60);
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        deadlineRef.current = Date.now() + minutes * 60 * 1000; // guards against a double fire before the index changes
        timeUpRef.current();
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [stage, index, minutes]);

  // Guard rails: leaving fullscreen or the tab counts against the interview.
  useEffect(() => {
    if (stage !== "interview") return undefined;
    const stopFullscreenWatch = onFullscreenChange(() => {
      if (finishedRef.current) return;
      if (!isFullscreen() && fullscreenSupported) {
        setOutOfFullscreen(true);
        registerViolation("You left fullscreen. Return to it to keep going.");
      } else {
        setOutOfFullscreen(false);
      }
    });
    const onVisibility = () => {
      if (document.hidden && !finishedRef.current) registerViolation("You switched away from the interview tab.");
    };
    const onBeforeUnload = (e) => { if (!finishedRef.current) { e.preventDefault(); e.returnValue = ""; } };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      stopFullscreenWatch();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [stage, fullscreenSupported, registerViolation]);

  // Leaving the page mid-interview (e.g. browser back) must not strand the user in fullscreen.
  useEffect(() => () => { exitFullscreen(); }, []);

  if (stage === "scoring") {
    return (
      <Layout>
        <Loader label="Reviewing your answers..." />
      </Layout>
    );
  }

  if (stage === "setup") {
    return (
      <Layout>
        <div className="mx-auto max-w-xl">
          <div className="mb-7 text-center">
            <span className="mb-3 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-light-sage px-3 py-1.5 text-sm font-semibold text-dark-green">
              <Mic size={14} aria-hidden="true" /> Mock interview
            </span>
            <h1 className="type-page-title">Practice interview</h1>
            <p className="mt-3 type-supporting">
              Answer role-specific questions in your own words and get feedback on how you did.
            </p>
          </div>

          <Card className="mb-5" elevated>
            <p className="mb-3 text-base font-semibold text-dark-green">Which role are you practising for?</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Role">
              {interviewCareers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={careerId === c.id}
                  onClick={() => setCareerId(c.id)}
                  className={`focus-ring min-h-11 rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                    careerId === c.id
                      ? "border-dark-green bg-light-sage text-dark-green"
                      : "border-border bg-off-white text-text-dark hover:bg-light-sage/60"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </Card>

          <Card className="mb-6" elevated>
            <p className="mb-3 text-base font-semibold text-dark-green">How many questions?</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Number of questions">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={count === n}
                  onClick={() => setCount(n)}
                  className={`focus-ring min-h-11 min-w-14 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    count === n
                      ? "border-dark-green bg-dark-green text-off-white"
                      : "border-border bg-off-white text-text-dark hover:bg-light-sage/60"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-3 type-meta">You can skip any question.</p>
          </Card>

          <Card className="mb-5" elevated>
            <p className="mb-3 flex items-center gap-2 text-base font-semibold text-dark-green"><Timer size={17} aria-hidden="true" /> Time per question</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Minutes per question">
              {TIME_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={minutes === m}
                  onClick={() => setMinutes(m)}
                  className={`focus-ring min-h-11 min-w-16 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    minutes === m
                      ? "border-dark-green bg-dark-green text-off-white"
                      : "border-border bg-off-white text-text-dark hover:bg-light-sage/60"
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
            <p className="mt-3 type-meta">Total: up to {count * minutes} minutes. When time runs out your answer is saved and the next question appears.</p>
          </Card>

          <Card className="mb-6 border-dark-green/20 bg-light-sage/50" elevated>
            <p className="mb-2 flex items-center gap-2 text-base font-semibold text-dark-green"><Maximize size={17} aria-hidden="true" /> Interview rules</p>
            <ul className="space-y-1.5 text-sm leading-6 text-text-dark">
              <li>{fullscreenSupported ? "The interview runs in fullscreen, like a real one. It starts when you press the button." : "Your device can't show fullscreen, so only the timer applies here."}</li>
              <li>Questions only move forward. There is no going back.</li>
              <li>{fullscreenSupported ? "Leaving fullscreen or switching tabs gives you a warning. " : "Switching tabs gives you a warning. "}After {MAX_VIOLATIONS} the interview ends and is scored with what you've answered.</li>
            </ul>
          </Card>

          {startError && <p className="mb-3 text-sm font-medium text-coral" role="alert">{startError}</p>}
          <Button variant="primary" size="lg" fullWidth icon={fullscreenSupported ? Maximize : ArrowRight} iconPosition="right" loading={starting} onClick={handleStart}>
            {starting ? "Preparing questions..." : fullscreenSupported ? `Enter fullscreen & start` : `Start ${career.title} interview`}
          </Button>

          {hasHistory && (
            <Button variant="ghost" fullWidth className="mt-3" icon={History} onClick={() => navigate("/interview-feedback")}>
              View my last result
            </Button>
          )}
        </div>
      </Layout>
    );
  }

  // ---- interview stage (fullscreen, no site navigation) ----
  const question = questions[index];
  const answer = answers[question.id] || "";
  const isLast = index === questions.length - 1;
  const words = countWords(answer);
  const answeredCount = questions.filter((q) => countWords(answers[q.id] || "") >= 3).length;
  const setAnswer = (value) => setAnswers((prev) => ({ ...prev, [question.id]: value }));
  const totalSeconds = minutes * 60;
  const low = remaining <= WARN_AT_SECONDS;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-cream">
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-light-sage px-3 py-1.5 text-sm font-semibold text-dark-green">
            <Mic size={14} aria-hidden="true" /> {career.title} interview
          </span>
          <span className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${violations ? "bg-coral/15 text-coral" : "text-text-muted"}`} title="Leaving fullscreen or the tab">
            <ShieldAlert size={14} aria-hidden="true" /> Warnings {violations}/{MAX_VIOLATIONS}
          </span>
        </div>

        <div className={`mb-5 rounded-xl border p-4 transition-colors ${low ? "border-coral bg-coral/10" : "border-border bg-off-white"}`}>
          <div className="flex items-end justify-between">
            <div>
              <p className="type-meta">Time left on this question</p>
              <p className={`font-heading text-5xl font-bold tabular-nums ${low ? "text-coral" : "text-dark-green"}`} role="timer" aria-live={low ? "polite" : "off"}>{formatTime(remaining)}</p>
            </div>
            <p className="pb-1 text-right type-meta">Question {index + 1} of {questions.length}</p>
          </div>
          <ProgressBar value={remaining} max={totalSeconds} label="Time remaining" color={low ? "bg-coral" : "bg-dark-green"} className="mt-3" />
        </div>

        {flash && <p className="mb-4 rounded-xl bg-light-sage px-4 py-3 text-sm font-semibold text-dark-green" role="alert">{flash}</p>}

        <p className="mb-3 inline-flex items-center gap-1 type-meta">
          <Sparkles size={12} aria-hidden="true" />
          {source === "ai" ? "AI-generated questions" : "Practice question bank"}
        </p>

        <Card className="mb-3" elevated>
          <span className="mb-2 inline-block rounded-full bg-light-sage px-2.5 py-0.5 text-xs font-semibold text-dark-green">
            {INTERVIEW_CATEGORIES[question.category] || "Behavioral"}
          </span>
          <p className="font-heading text-xl font-semibold leading-snug text-dark-green">{question.text}</p>
        </Card>

        {question.hint && (
          <details className="mb-4 rounded-xl border border-border bg-off-white px-4 py-3 text-sm text-text-muted">
            <summary className="focus-ring flex min-h-8 cursor-pointer items-center gap-2 font-semibold text-dark-green">
              <Lightbulb size={15} aria-hidden="true" /> Need a hint?
            </summary>
            <p className="mt-2 leading-6">{question.hint}</p>
          </details>
        )}

        <label htmlFor="interview-answer" className="sr-only">Your answer</label>
        <textarea
          key={question.id}
          id="interview-answer"
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={8}
          placeholder="Type your answer here..."
          className="focus-ring w-full rounded-xl border border-border bg-off-white p-4 text-base leading-7 text-text-dark outline-none focus:border-dark-green sm:text-sm"
        />
        <p className="mt-2 text-right type-meta">{words} {words === 1 ? "word" : "words"} · aim for 60–150</p>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-4"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => advance(false)}
          disabled={!answer.trim() && (!isLast || answeredCount === 0)}
        >
          {isLast ? "Finish interview" : "Next question"}
        </Button>

        <div className="mt-3 flex gap-3">
          {!isLast && (
            <Button variant="ghost" fullWidth icon={SkipForward} iconPosition="right" onClick={() => advance(false)}>
              Skip
            </Button>
          )}
          {!confirmEnd ? (
            <Button variant="ghost" fullWidth icon={XCircle} onClick={() => setConfirmEnd(true)} disabled={answeredCount === 0}>End interview</Button>
          ) : (
            <Button variant="coral" fullWidth onClick={() => finish(answersRef.current, "manual")}>Yes, end and score it</Button>
          )}
        </div>
        {confirmEnd && <button type="button" onClick={() => setConfirmEnd(false)} className="focus-ring mt-2 self-center rounded-full px-3 py-1 text-sm font-semibold text-text-muted">Keep going</button>}
      </div>

      {outOfFullscreen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-dark-green/90 p-6" role="alertdialog" aria-modal="true" aria-labelledby="fs-title">
          <div className="w-full max-w-md rounded-2xl bg-off-white p-7 text-center shadow-soft">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/15 text-coral"><ShieldAlert size={28} aria-hidden="true" /></span>
            <h2 id="fs-title" className="font-heading text-2xl font-bold text-dark-green">Fullscreen is required</h2>
            <p className="mt-3 text-base leading-7 text-text-dark">You left fullscreen, which counts as warning {violations} of {MAX_VIOLATIONS}. The clock is still running ({formatTime(remaining)} left on this question).</p>
            <Button className="mt-6" size="lg" fullWidth icon={Maximize} onClick={() => enterFullscreen()}>Return to fullscreen</Button>
          </div>
        </div>
      )}
    </div>
  );
}
