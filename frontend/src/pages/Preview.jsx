import { ArrowRight, BarChart3, ClipboardCheck, Map, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Logo from "../components/Logo";
import AssessmentMatchPreview from "../components/AssessmentMatchPreview";

const steps = [
  [ClipboardCheck, "Career assessment", "Answer 30 thoughtful questions about how you work and what motivates you."],
  [Target, "Personalized career matches", "See which of six supported paths align with your assessment traits."],
  [BarChart3, "Career information and skill readiness", "Explore the role, its core skills, and the areas you can build."],
  [Map, "Suggested career roadmap", "Choose a direction and open a practical sequence of next steps."],
];

export default function Preview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-off-white">
        <div className="container-app flex h-16 items-center justify-between">
          <Logo to="/" />
          <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
        </div>
      </header>

      <main>
        <section className="container-app grid gap-10 py-14 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <p className="type-eyebrow">A guided preview</p>
            <h1 className="mt-4 max-w-2xl font-heading text-4xl font-bold leading-tight text-dark-green sm:text-5xl">See how Pathwise turns reflection into a next step.</h1>
            <p className="mt-5 max-w-xl type-body">This public preview shows the product journey without inventing a personal result. Your own assessment and recommendations begin after you create an account.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/signup")}>Create your profile</Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/login")}>I already have an account</Button>
            </div>
          </div>
          <AssessmentMatchPreview />
        </section>

        <section className="border-t border-border bg-off-white py-14 lg:py-20">
          <div className="container-app">
            <div className="max-w-2xl">
              <p className="type-eyebrow">How Pathwise works</p>
              <h2 className="mt-3 type-section-title">Four useful moments, connected.</h2>
              <p className="mt-4 type-body">The product starts with your answers and keeps the reasoning visible as you explore.</p>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map(([Icon, title, text], index) => (
                <div key={title} className="border-t-2 border-sage pt-5">
                  <div className="flex items-center justify-between">
                    <p className="type-meta text-coral">0{index + 1}</p>
                    <Icon className="text-dark-green" size={23} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <h2 className="mt-7 font-heading text-2xl font-bold text-dark-green">{title}</h2>
                  <p className="mt-2 type-supporting">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-app py-14 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-6 border-t border-border pt-8 sm:flex-row sm:items-end">
            <div>
              <p className="type-eyebrow">Ready when you are</p>
              <h2 className="mt-3 max-w-2xl font-heading text-3xl font-bold text-dark-green">Start with your own answers, not someone else&apos;s result.</h2>
            </div>
            <Button icon={ArrowRight} iconPosition="right" onClick={() => navigate("/signup")}>Create your profile</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
