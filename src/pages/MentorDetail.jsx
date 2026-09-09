import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, BadgeCheck, Briefcase, GraduationCap, Lightbulb, Mic2, LineChart } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import { mentorApi } from "../services/api";

const topicIcons = {
  "Career Guidance": Briefcase,
  "Skill Development": GraduationCap,
  "Project Idea": Lightbulb,
  "Project Ideas": Lightbulb,
  "Interview Preparation": Mic2,
  "Industry Insight": LineChart,
};

export default function MentorDetail() {
  const { mentor: mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mentorApi.getById(mentorId).then((data) => {
      setMentor(data);
      setLoading(false);
    });
  }, [mentorId]);

  if (loading) {
    return (
      <Layout>
        <Loader label="Loading mentor..." />
      </Layout>
    );
  }

  if (!mentor) {
    return (
      <Layout>
        <p className="text-center text-text-muted">Mentor not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-4">
        <BackButton to="/mentors" />
      </div>

      <div className="mx-auto max-w-2xl">
        <Card className="mb-6 flex flex-col items-center gap-3 py-8 text-center">
          <Avatar name={mentor.name} color={mentor.avatarColor} size={84} />
          <h1 className="font-heading text-2xl font-bold text-dark-green">{mentor.name}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-light-sage px-3 py-1 text-xs font-semibold text-dark-green">
            <BadgeCheck size={14} /> AI Mentor · {mentor.profession}
          </span>
          <p className="mt-2 max-w-md text-sm text-text-muted">{mentor.description}</p>
        </Card>

        <Card className="mb-6">
          <h2 className="mb-4 font-heading text-lg font-bold text-dark-green">
            What I can help you with
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mentor.topics.map((topic) => {
              const Icon = topicIcons[topic] || Lightbulb;
              return (
                <div
                  key={topic}
                  className="flex items-center gap-3 rounded-xl border border-border bg-cream px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-light-sage text-dark-green">
                    <Icon size={17} />
                  </span>
                  <span className="text-sm font-medium text-text-dark">{topic}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={MessageCircle}
          onClick={() => navigate(`/mentors/${mentor.id}/chat`)}
        >
          Start Chat
        </Button>
      </div>
    </Layout>
  );
}
