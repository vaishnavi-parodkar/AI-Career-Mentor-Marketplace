import { useNavigate } from "react-router-dom";
import { Leaf, Sparkles, Compass, TrendingUp } from "lucide-react";
import Button from "../components/Button";
import Logo from "../components/Logo";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop nav */}
      <header className="container-app flex h-20 items-center justify-between">
        <Logo to="/" />
        <div className="hidden items-center gap-3 sm:flex">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button variant="primary" onClick={() => navigate("/signup")}>
            Create Account
          </Button>
        </div>
      </header>

      <section className="container-app grid grid-cols-1 items-center gap-10 pb-16 pt-6 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-16">
        {/* Text / actions */}
        <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-light-sage px-4 py-1.5 text-xs font-semibold text-dark-green">
            <Sparkles size={14} /> AI-Powered Career Guidance
          </span>
          <h1 className="mb-4 font-heading text-4xl font-bold leading-tight text-dark-green sm:text-5xl lg:text-6xl">
            Welcome to Pathwise
          </h1>
          <p className="mb-8 max-w-md text-base text-text-muted sm:text-lg">
            Discover careers that truly fit you. Take an AI-powered assessment,
            explore personalized recommendations, and build a roadmap for the
            future you want.
          </p>

          <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row">
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate("/signup")}>
              I'm New Here — Create Account
            </Button>
            <Button variant="outline" size="lg" fullWidth onClick={() => navigate("/login")}>
              I Already Have an Account
            </Button>
          </div>

          <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              icon={Compass}
              onClick={() => navigate("/login")}
            >
              Take Assessment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              icon={TrendingUp}
              onClick={() => navigate("/login")}
            >
              Explore Careers
            </Button>
          </div>
        </div>

        {/* Illustration */}
        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-light-sage sm:h-96 sm:w-96">
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-sage/60" />
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-off-white shadow-soft sm:h-52 sm:w-52">
              <Leaf className="text-dark-green" size={72} strokeWidth={1.5} />
            </div>
            <div className="absolute -right-2 top-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-coral text-off-white shadow-soft sm:h-20 sm:w-20">
              <Sparkles size={28} />
            </div>
            <div className="absolute -left-4 bottom-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-green text-off-white shadow-soft sm:h-20 sm:w-20">
              <TrendingUp size={28} />
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip for desktop polish */}
      <section className="border-t border-border bg-off-white/60 py-12">
        <div className="container-app grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Compass,
              title: "Discover",
              text: "Understand your strengths through a science-backed AI assessment.",
            },
            {
              icon: Sparkles,
              title: "Connect",
              text: "Chat with AI mentors modeled on real career paths.",
            },
            {
              icon: TrendingUp,
              title: "Grow",
              text: "Follow a personalized roadmap from student to job-ready.",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-light-sage text-dark-green">
                <f.icon size={22} />
              </div>
              <h3 className="mb-1 font-heading text-lg font-bold text-dark-green">{f.title}</h3>
              <p className="text-sm text-text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
