import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, Briefcase, GraduationCap, Lightbulb, Mic2, LineChart, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import { mentorApi } from "../services/api";
import { getMentorImage } from "../data/mentorImages";

const topicIcons = { "Career Guidance": Briefcase, "Skill Development": GraduationCap, "Project Idea": Lightbulb, "Project Ideas": Lightbulb, "Interview Preparation": Mic2, "Industry Insight": LineChart };

export default function MentorDetail() {
  const { mentor: mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    mentorApi.getById(mentorId).then((data) => {
      if (!active) return;
      setMentor(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, [mentorId]);

  if (loading) return <Layout><Loader label="Loading mentor..." /></Layout>;
  if (!mentor) return <Layout><p className="py-12 text-center type-supporting">Mentor not found.</p></Layout>;

  return (
    <Layout>
      <div className="mb-5"><BackButton to="/mentors" /></div>
      <div className="mx-auto max-w-6xl">
        <Card className="mb-6 overflow-hidden p-0" elevated>
          <div className="grid items-center gap-8 bg-gradient-to-br from-dark-green via-green to-dark-green px-6 py-8 text-off-white md:grid-cols-[220px_1fr] md:px-10">
            <Avatar name={mentor.name} color={mentor.avatarColor} image={getMentorImage(mentor)} size={144} className="mx-auto border-4 border-off-white/80 shadow-soft" />
            <div className="text-center md:text-left">
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-sage">AI mentor persona</p>
            <h1 className="font-heading text-3xl font-bold text-off-white">{mentor.name}</h1>
            <p className="text-base font-semibold text-off-white/85">{mentor.profession}</p>
            <p className="mt-3 max-w-3xl text-base leading-7 text-off-white/80">{mentor.bio || mentor.description}</p>
            <Button className="mt-5" size="lg" icon={MessageCircle} onClick={() => navigate(`/mentors/${mentor.id}/chat`)}>Chat instantly</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 px-6 py-5 md:px-10">
            {mentor.skills?.map((s) => <span key={s} className="rounded-full border border-border bg-cream px-3 py-1 text-xs font-semibold text-text-dark">{s}</span>)}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="mb-6 h-fit" elevated>
          <p className="type-eyebrow">Topics</p>
          <h2 className="mt-2 type-section-title">What I can help you with</h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mentor.topics.map((topicName) => { const Icon = topicIcons[topicName] || Lightbulb; return <div key={topicName} className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-cream px-4 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-light-sage text-dark-green"><Icon size={17} aria-hidden="true" /></span><span className="text-base font-medium text-text-dark">{topicName}</span></div>; })}
          </div>
        </Card>

        {mentor.knowledge?.length > 0 && (
          <Card className="mb-6 h-fit" elevated>
            <h2 className="type-section-title">Approved mentor notes</h2>
            <p className="mt-1 text-xs text-text-muted">The chat assistant uses these notes when answering.</p>
            <div className="mt-3 space-y-3">{mentor.knowledge.map((k, i) => <div key={i} className="rounded-xl bg-cream p-3 text-sm"><p className="font-semibold text-dark-green">{k.title}</p><p className="mt-1 text-text-muted">{k.body}</p></div>)}</div>
          </Card>
        )}
        </div>

        <Card className="mb-6 border-dark-green bg-light-sage/60" elevated>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 shrink-0 text-coral" size={22} aria-hidden="true" />
            <div><h2 className="font-heading text-xl font-bold text-dark-green">Always-on guidance</h2><p className="mt-1 text-sm leading-6 text-text-dark">This is an AI persona you can talk to whenever you need. Ask questions, explore ideas, and return to your saved chat history anytime.</p></div>
          </div>
        </Card>
        <Button variant="primary" size="lg" fullWidth icon={MessageCircle} onClick={() => navigate(`/mentors/${mentor.id}/chat`)}>Chat with {mentor.name}</Button>
      </div>
    </Layout>
  );
}
