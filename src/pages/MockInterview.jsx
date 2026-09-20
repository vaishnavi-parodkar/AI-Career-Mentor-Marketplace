import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import { interviewQuestions } from "../data/roadmap";
import { skillGap } from "../data/roadmap";

export default function MockInterview() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const isLast = index === interviewQuestions.length - 1;

  const handleNext = () => {
    setAnswer("");
    if (isLast) {
      navigate("/interview-feedback");
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <div className="mb-7 text-center">
          <span className="mb-3 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-light-sage px-3 py-1.5 text-sm font-semibold text-dark-green"><Mic size={14} aria-hidden="true" /> Mock interview · {skillGap.career}</span>
          <h1 className="type-page-title">Practice interview</h1>
        </div>

        <div className="mb-5">
          <div className="mb-3 flex justify-between text-sm font-semibold text-text-muted"><span>Question {index + 1} of {interviewQuestions.length}</span><span>{Math.round(((index + 1) / interviewQuestions.length) * 100)}%</span></div>
          <ProgressBar value={index + 1} max={interviewQuestions.length} label="Interview progress" />
        </div>

        <Card className="mb-5" elevated><p className="font-heading text-xl font-semibold leading-snug text-dark-green">{interviewQuestions[index]}</p></Card>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          placeholder="Type your answer here..."
          className="focus-ring w-full rounded-xl border border-border bg-off-white p-4 text-base leading-7 text-text-dark outline-none focus:border-dark-green sm:text-sm"
        />

        <Button variant="primary" size="lg" fullWidth className="mt-5" icon={ArrowRight} iconPosition="right" onClick={handleNext} disabled={!answer.trim()}>
          {isLast ? "Finish interview" : "Next question"}
        </Button>
      </div>
    </Layout>
  );
}
