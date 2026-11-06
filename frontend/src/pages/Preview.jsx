import { ArrowRight, BarChart3, Bot, ClipboardCheck, Map, MessageCircle, Search, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Logo from "../components/Logo";
import Card from "../components/Card";
import { mentors } from "../data/mentors";
import { careers } from "../data/careers";

const productAreas = [
  { icon: Target, title: "Career direction", text: "Compare six career paths, see the work behind each one, and understand what makes a role a fit.", label: "Browse careers" },
  { icon: Bot, title: "AI mentor personas", text: "Chat with profession-specific AI mentors whenever you need a second opinion, a plan, or practice.", label: "Meet the mentors" },
  { icon: Map, title: "A practical next step", text: "Turn a possible direction into a skill gap, learning resources, and a roadmap you can work through.", label: "See the journey" },
  { icon: BarChart3, title: "Progress you can see", text: "Track readiness, interview practice, simulations, and the small actions that move you forward.", label: "View progress" },
];

export default function Preview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-off-white">
        <div className="container-app flex h-16 items-center justify-between">
          <Logo to="/" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
            <Button variant="coral" onClick={() => navigate("/signup")}>Create your profile</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border bg-dark-green text-off-white">
          <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-sage/20 blur-3xl" />
          <div className="container-app relative grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
            <div>
              <p className="type-eyebrow text-sage">Explore before you commit</p>
              <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold leading-tight text-off-white sm:text-6xl">See what your career journey could look like.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-off-white/80">Browse the kinds of careers, AI mentors, and progress tools Pathwise brings together. Your personal assessment stays private until you create an account.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" variant="coral" icon={ArrowRight} iconPosition="right" onClick={() => navigate("/signup")}>Start with your profile</Button>
                <Button size="lg" variant="ghost" onClick={() => navigate("/login")} className="border border-white/30 text-off-white hover:bg-white/10 hover:text-off-white">I already have an account</Button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-off-white/10 p-5 backdrop-blur-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <span className="text-sm font-semibold text-sage">Your Pathwise workspace</span>
                <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage">Preview mode</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["Career matches", "AI mentor chat", "Skill gap", "Roadmap"].map((item, index) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/10 p-4">
                    <p className="text-xs font-semibold text-off-white/60">0{index + 1}</p>
                    <p className="mt-5 font-heading text-lg font-bold text-off-white">{item}</p>
                    <p className="mt-1 text-sm text-off-white/60">{index === 0 ? "Understand your options" : index === 1 ? "Ask whenever you need" : index === 2 ? "Know what to build" : "Keep moving with a plan"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container-app py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="type-eyebrow">A guided platform, not a single quiz</p>
            <h2 className="mt-3 type-section-title">Explore the parts that make the journey useful.</h2>
            <p className="mt-4 type-body">Pathwise connects reflection, exploration, practice, and action. The assessment is the personal starting point—but it is only one part of the platform.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {productAreas.map(({ icon: Icon, title, text, label }, index) => (
              <Card key={title} className="group flex flex-col border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-soft" elevated>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-light-sage text-dark-green"><Icon size={20} aria-hidden="true" /></span>
                <p className="mt-5 type-meta text-coral">0{index + 1}</p>
                <h3 className="mt-2 font-heading text-xl font-bold text-dark-green">{title}</h3>
                <p className="mt-2 flex-1 type-supporting">{text}</p>
                <p className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-dark-green">{label} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></p>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-off-white py-16 lg:py-20">
          <div className="container-app grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <div>
              <p className="type-eyebrow">Career exploration</p>
              <h2 className="mt-3 type-section-title">Start broad. Get specific when you are ready.</h2>
              <p className="mt-4 type-body">Browse role snapshots and compare the work, skills, demand, and growth behind each direction. Once you sign in, your assessment can turn exploration into a personal recommendation.</p>
              <div className="mt-6 flex items-center gap-3 text-sm text-text-muted"><Search size={17} className="text-green" aria-hidden="true" /> Six career paths to explore</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {careers.slice(0, 4).map((career) => <div key={career.id} className="rounded-xl border border-border bg-cream p-4 transition-transform duration-300 hover:-translate-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-coral">{career.market.demand} demand</p><h3 className="mt-2 font-heading text-xl font-bold text-dark-green">{career.title}</h3><p className="mt-1 text-sm text-text-muted">{career.tagline}</p><div className="mt-4 flex flex-wrap gap-1.5">{career.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded-full bg-light-sage px-2.5 py-1 text-xs font-semibold text-dark-green">{skill}</span>)}</div></div>)}
            </div>
          </div>
        </section>

        <section className="container-app py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="type-eyebrow">AI mentor marketplace</p>
              <h2 className="mt-3 type-section-title">A useful conversation is always one message away.</h2>
              <p className="mt-4 type-body">Choose an AI mentor persona by profession and chat directly about skills, interviews, projects, or your next move. There is no scheduling step.</p>
              <Button className="mt-6" variant="outline" icon={MessageCircle} onClick={() => navigate("/signup")}>Unlock mentor chat</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {mentors.slice(0, 3).map((mentor) => <div key={mentor.id} className="rounded-2xl border border-border bg-off-white p-4 shadow-card"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-light-sage text-xl" aria-hidden="true">{mentor.initials}</div><h3 className="mt-4 font-heading text-lg font-bold text-dark-green">{mentor.name}</h3><p className="mt-1 text-sm font-semibold text-coral">{mentor.profession}</p><p className="mt-3 text-sm leading-6 text-text-muted">{mentor.description}</p></div>)}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-light-sage/50 py-14">
          <div className="container-app flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div><p className="type-eyebrow">Personalization starts here</p><h2 className="mt-2 type-section-title">Ready to see your own direction?</h2><p className="mt-2 type-supporting">The assessment and recommendations are available after you create an account.</p></div>
            <Button size="lg" icon={ClipboardCheck} onClick={() => navigate("/signup")}>Create your profile</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
