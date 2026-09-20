import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  Compass,
  Leaf,
  Map,
  MessageCircle,
  Target,
  TrendingUp,
} from "lucide-react";
import Button from "../components/Button";
import Logo from "../components/Logo";
import MediaFrame from "../components/MediaFrame";
import AssessmentMatchPreview from "../components/AssessmentMatchPreview";
import { landingContent } from "../data/landingContent";

const journey = [
  { number: "01", icon: ClipboardCheck, title: "Assessment", text: "Answer 30 thoughtful questions about how you think, work, and grow." },
  { number: "02", icon: Target, title: "Career Match", text: "See which of six supported paths align with the patterns in your responses." },
  { number: "03", icon: Brain, title: "Skill Readiness", text: "Explore the role skills and decide where focused practice can help." },
  { number: "04", icon: Map, title: "Career Roadmap", text: "Choose a direction and follow a suggested sequence of next steps." },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-cream">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/15 text-off-white">
        <div className="container-app flex h-20 items-center justify-between">
          <Logo to="/" className="[&>span:last-child]:text-off-white" />
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex" aria-label="Public navigation">
            <a href="#how-it-works" className="focus-ring rounded-full px-2 py-1 transition-opacity hover:opacity-70">How it works</a>
            <a href="#why-pathwise" className="focus-ring rounded-full px-2 py-1 transition-opacity hover:opacity-70">Why Pathwise</a>
            <a href="#mentors" className="focus-ring rounded-full px-2 py-1 transition-opacity hover:opacity-70">Mentors</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")} className="text-off-white hover:bg-white/10 hover:text-off-white">
              Login
            </Button>
            <Button variant="coral" onClick={() => navigate("/signup")}>Create your profile</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-dark-green text-off-white">
          <div className="absolute inset-0 -z-20 h-full min-h-[760px]">
            <MediaFrame
              src={landingContent.heroImage}
              alt={landingContent.heroImageAlt}
              loading="eager"
              fetchPriority="high"
              fallbackLabel="Career guidance"
              className="h-full min-h-[760px] w-full"
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,76,59,0.98)_0%,rgba(6,76,59,0.88)_40%,rgba(6,76,59,0.46)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-dark-green to-transparent" />

          <div className="container-app grid min-h-[760px] items-end gap-12 pb-16 pt-32 sm:pb-20 lg:grid-cols-[1fr_0.78fr] lg:items-center lg:gap-16 lg:pb-12">
            <div className="max-w-2xl">
              <p className="type-eyebrow mb-6 text-sage">Assessment-based career guidance</p>
              <h1 className="mb-6 max-w-2xl font-heading text-5xl font-bold leading-[1.02] text-off-white sm:text-6xl lg:text-7xl">
                Find work that feels like a direction, not a guess.
              </h1>
              <p className="mb-8 max-w-xl text-base leading-7 text-off-white/90 sm:text-lg">
                Pathwise maps how you think and work to six supported career paths, then shows the skills and next steps behind each match.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="coral" size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/signup")}>
                  Create your profile
                </Button>
                <Button variant="ghost" size="lg" icon={Compass} onClick={() => navigate("/preview")} className="border border-white/30 text-off-white hover:bg-white/10 hover:text-off-white">
                  See the product preview
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center self-center lg:justify-end" aria-label="Pathwise symbol">
              <Leaf
                size={280}
                strokeWidth={1.15}
                aria-hidden="true"
                className="h-48 w-48 bg-transparent text-sage drop-shadow-[0_24px_50px_rgba(0,0,0,0.22)] sm:h-64 sm:w-64 lg:h-80 lg:w-80"
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="container-app pb-16 pt-16 lg:pb-24 lg:pt-20">
          <div className="mb-10 max-w-2xl">
            <p className="type-eyebrow mb-3">From uncertainty to a clearer direction</p>
            <h2 className="type-section-title mb-4">A little less noise. A lot more next step.</h2>
            <p className="type-body max-w-2xl">
              Pathwise connects the moments that matter: a thoughtful assessment, a match you can understand, the skills behind the role, and a suggested path forward.
            </p>
          </div>

          <div className="relative grid gap-9 md:grid-cols-4 md:gap-5">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />
            {journey.map((step) => (
              <div key={step.number} className="relative">
                <div className="mb-5 flex h-14 w-14 items-center justify-center border border-dark-green bg-cream text-dark-green">
                  <step.icon size={23} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <p className="type-meta mb-2 text-coral">{step.number}</p>
                <h3 className="mb-2 font-heading text-xl font-bold text-dark-green">{step.title}</h3>
                <p className="type-supporting">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="why-pathwise" className="bg-off-white py-16 lg:py-20">
          <div className="container-app grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <AssessmentMatchPreview className="rounded-[2rem]" />
            <div>
              <p className="type-eyebrow mb-3">Why Pathwise</p>
              <h2 className="type-section-title mb-6">Guidance that stays grounded in you.</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-sage text-dark-green"><Target size={18} aria-hidden="true" /></span>
                  <div><h3 className="mb-1 text-base font-bold text-text-dark">See the reasoning</h3><p className="type-supporting">Understand the traits behind a match instead of being handed a mysterious result.</p></div>
                </div>
                <div className="flex gap-4">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-sage text-dark-green"><TrendingUp size={18} aria-hidden="true" /></span>
                  <div><h3 className="mb-1 text-base font-bold text-text-dark">Build the right skills</h3><p className="type-supporting">Move from a possible career to the skills and practice that help you pursue it.</p></div>
                </div>
                <div className="flex gap-4">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-light-sage text-dark-green"><MessageCircle size={18} aria-hidden="true" /></span>
                  <div><h3 className="mb-1 text-base font-bold text-text-dark">Ask better questions</h3><p className="type-supporting">Use profession-specific mentors when you need perspective on the road ahead.</p></div>
                </div>
              </div>
              <Button variant="outline" className="mt-8" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/signup")}>Create your profile</Button>
            </div>
          </div>
        </section>

        <section id="mentors" className="bg-dark-green py-16 text-off-white lg:py-20">
          <div className="container-app flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="type-eyebrow mb-3 text-sage">The next mile</p>
              <h2 className="mb-4 font-heading text-3xl font-bold leading-tight text-off-white sm:text-4xl">You do not need the whole map today.</h2>
              <p className="text-base leading-7 text-off-white/85">Start with one honest answer. Pathwise will help you turn it into a direction, then a plan you can actually use.</p>
            </div>
            <Button variant="coral" size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/signup")}>Create your profile</Button>
          </div>
        </section>
      </main>

      <footer className="bg-cream py-8">
        <div className="container-app flex flex-col gap-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <Logo to="/" />
          <p>Career clarity for the road ahead.</p>
        </div>
      </footer>
    </div>
  );
}
