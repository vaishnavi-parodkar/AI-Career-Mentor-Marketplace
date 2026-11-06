import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Layout from "../components/Layout";
import MentorCard from "../components/MentorCard";
import Tabs from "../components/Tabs";
import Button from "../components/Button";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { mentorApi } from "../services/api";
import { useLanguage } from "../i18n";

const categories = [{ label: "All", value: "all" }, { label: "Tech", value: "tech" }, { label: "Business", value: "business" }, { label: "People", value: "people" }];

export default function MentorMarketplace() {
  const { t } = useLanguage();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const run = () => {
    setLoading(true);
    mentorApi
      .getAll({ q: query, category })
      .then(setMentors)
      .finally(() => setLoading(false));
  };

  useEffect(run, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (event) => {
    event.preventDefault();
    run();
  };

  return (
    <Layout>
      <div className="mb-7">
        <p className="type-eyebrow">Perspective when you need it</p>
        <h1 className="mt-2 type-page-title">{t("mentors.title")}</h1>
        <p className="mt-3 max-w-2xl type-body">Meet AI mentor personas built for different career paths. Describe what you are working toward and start a focused conversation instantly—no scheduling or waiting.</p>
      </div>

      <form onSubmit={submit} className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} aria-hidden="true" />
            <input aria-label="Describe your career goal" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. I want to become a backend developer and crack product-company interviews" className="focus-ring min-h-11 w-full rounded-full border border-border bg-off-white py-3 pl-11 pr-4 text-base outline-none sm:text-sm" />
          </div>
          <Button type="submit" icon={SlidersHorizontal}>Find mentors</Button>
        </div>
      </form>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs className="w-fit" tabs={categories} active={category} onChange={setCategory} />
        <p className="text-sm text-text-muted">{mentors.length} mentor personas available</p>
      </div>

      {loading ? <Loader label="Matching mentors..." /> : mentors.length === 0 ? (
        <EmptyState icon={Search} title="No mentors found" description="Try removing a filter or describing your goal differently." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
        </div>
      )}
    </Layout>
  );
}
