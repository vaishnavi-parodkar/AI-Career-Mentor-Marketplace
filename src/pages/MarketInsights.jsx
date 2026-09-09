import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, MapPin, Globe2 } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import MetricCard from "../components/MetricCard";
import ProgressBar from "../components/ProgressBar";
import Loader from "../components/Loader";
import { careerApi } from "../services/api";

export default function MarketInsights() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careerApi.getAll().then((data) => {
      setCareers(data);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Career Market Insights</h1>
        <p className="text-sm text-text-muted">
          Live-style snapshot of demand, salary and opportunity across career paths.
        </p>
      </div>

      {loading ? (
        <Loader label="Loading market data..." />
      ) : (
        <div className="flex flex-col gap-5">
          {careers.map((c) => (
            <Card key={c.id}>
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-heading text-lg font-bold text-dark-green">{c.title}</h2>
                <span className="text-xs font-semibold text-text-muted">
                  Industry trend: <span className="text-green">Growing</span>
                </span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard icon={DollarSign} label="Avg. Salary" value={c.market.avgSalary} />
                <MetricCard icon={TrendingUp} label="Job Demand" value={c.market.demand} />
                <MetricCard icon={MapPin} label="Top Location" value={c.market.topLocation} />
                <MetricCard icon={Globe2} label="Global Opportunities" value={`${c.market.globalOpportunities}%`} />
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold text-text-muted">
                  Global Opportunity Index
                </p>
                <ProgressBar value={c.market.globalOpportunities} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
