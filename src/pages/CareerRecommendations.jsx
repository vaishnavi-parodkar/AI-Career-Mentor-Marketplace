import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GitCompare } from "lucide-react";
import Layout from "../components/Layout";
import CareerCard from "../components/CareerCard";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { careerApi } from "../services/api";

export default function CareerRecommendations() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careerApi.getAll().then((data) => {
      setCareers([...data].sort((a, b) => b.match - a.match));
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Recommended Career Matches</h1>
          <p className="text-sm text-text-muted">Based on your assessment and profile.</p>
        </div>
        <Button variant="outline" icon={GitCompare} onClick={() => navigate("/compare")}>
          Compare Careers
        </Button>
      </div>

      {loading ? (
        <Loader label="Finding your best matches..." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {careers.map((c) => (
            <CareerCard key={c.id} career={c} />
          ))}
        </div>
      )}
    </Layout>
  );
}
