import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, MapPin, Globe2, CheckCircle2 } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import MatchRing from "../components/MatchRing";
import MetricCard from "../components/MetricCard";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import { careerApi } from "../services/api";
import { useAssessment } from "../context/AssessmentContext";

export default function CareerDetail() {
  const { career: careerId } = useParams();
  const navigate = useNavigate();
  const { setSelectedCareerId } = useAssessment();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    careerApi.getById(careerId).then((data) => {
      setCareer(data);
      setLoading(false);
    });
  }, [careerId]);

  const handleSelect = () => {
    setSelectedCareerId(careerId);
    navigate("/roadmap");
  };

  if (loading) {
    return (
      <Layout>
        <Loader label="Loading career details..." />
      </Layout>
    );
  }

  if (!career) {
    return (
      <Layout>
        <p className="text-center text-text-muted">Career not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-4">
        <BackButton to="/careers" />
      </div>

      <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-bold text-dark-green sm:text-4xl">
            {career.title}
          </h1>
          <p className="text-text-muted">{career.tagline}</p>
        </div>
        <div className="flex items-center gap-3 self-center">
          <MatchRing value={career.match} size={72} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <h2 className="mb-2 font-heading text-lg font-bold text-dark-green">Overview</h2>
            <p className="text-sm leading-relaxed text-text-dark/80">{career.description}</p>
          </Card>

          <Card>
            <h2 className="mb-3 font-heading text-lg font-bold text-dark-green">Key Skills</h2>
            <div className="flex flex-wrap gap-2">
              {career.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-light-sage px-3 py-1.5 text-xs font-medium text-dark-green"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-heading text-lg font-bold text-dark-green">Responsibilities</h2>
            <ul className="flex flex-col gap-2.5">
              {career.responsibilities.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-text-dark/85">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-green" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="mb-2 font-heading text-lg font-bold text-dark-green">Career Growth</h2>
            <p className="text-sm text-text-dark/80">{career.growth}</p>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="mb-3 font-heading text-base font-bold text-dark-green">Market Insights</h2>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={DollarSign} label="Avg. Salary" value={career.market.avgSalary} />
              <MetricCard icon={TrendingUp} label="Job Demand" value={career.market.demand} />
              <MetricCard icon={MapPin} label="Top Location" value={career.market.topLocation} />
              <MetricCard icon={Globe2} label="Global Opportunities" value={`${career.market.globalOpportunities}%`} />
            </div>
          </Card>

          <Card className="bg-light-sage/50">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Salary Range
            </p>
            <p className="font-heading text-xl font-bold text-dark-green">{career.salaryRange}</p>
          </Card>

          <Button variant="coral" size="lg" fullWidth onClick={handleSelect}>
            Select This Career
          </Button>
        </div>
      </div>
    </Layout>
  );
}
