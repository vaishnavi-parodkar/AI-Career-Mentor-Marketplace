import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Sparkles, ArrowRight, Users } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Card from "../components/Card";
import CareerCard from "../components/CareerCard";
import Loader from "../components/Loader";
import { careerApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careerApi.getAll().then((data) => {
      setCareers([...data].sort((a, b) => b.match - a.match).slice(0, 3));
      setLoading(false);
    });
  }, []);

  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <Layout>
      {/* Hero */}
      <section className="mb-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-coral">Hi {firstName},</p>
          <h1 className="mb-4 font-heading text-3xl font-bold leading-tight text-dark-green sm:text-4xl lg:text-5xl">
            Find the career that fits you.
          </h1>
          <p className="mb-7 max-w-md text-base text-text-muted">
            Discover your strengths, explore careers and build a personalized
            roadmap for your future.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg" icon={Sparkles} onClick={() => navigate("/assessment")}>
              Take Assessment
            </Button>
            <Button variant="outline" size="lg" icon={Compass} onClick={() => navigate("/careers")}>
              Explore Careers
            </Button>
          </div>
        </div>

        <Card className="hidden bg-light-sage/60 lg:block">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-heading text-2xl font-bold text-dark-green">30</p>
              <p className="text-xs text-text-muted">Assessment Questions</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-dark-green">6</p>
              <p className="text-xs text-text-muted">AI Mentors</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-dark-green">50+</p>
              <p className="text-xs text-text-muted">Career Paths</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Recommended matches */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">Recommended Career Matches</h2>
          <button
            onClick={() => navigate("/careers")}
            className="flex items-center gap-1 text-sm font-semibold text-dark-green"
          >
            View all <ArrowRight size={15} />
          </button>
        </div>

        {loading ? (
          <Loader label="Loading your matches..." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((c) => (
              <CareerCard key={c.id} career={c} />
            ))}
          </div>
        )}
      </section>

      {/* Mentor marketplace CTA */}
      <section>
        <Card className="flex flex-col items-center gap-5 bg-dark-green p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-off-white/10 text-off-white">
            <Users size={28} />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-heading text-xl font-bold text-off-white">
              AI Mentor Marketplace
            </h3>
            <p className="text-sm text-off-white/80">
              Chat with AI mentors modeled on real professionals to get guidance, tailored to your goals.
            </p>
          </div>
          <Button variant="coral" onClick={() => navigate("/mentors")}>
            Meet Mentors
          </Button>
        </Card>
      </section>
    </Layout>
  );
}
