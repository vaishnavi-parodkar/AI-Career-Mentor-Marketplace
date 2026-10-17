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
  const [language, setLanguage] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minRating, setMinRating] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const run = () => {
    setLoading(true);
    mentorApi
      .getAll({ q: query, category, language, maxRate, minRating, availableOnly: availableOnly || undefined })
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
        <p className="mt-3 type-body">Describe your career goal in your own words. Mentors are ranked by how well their expertise matches it, and each card says why.</p>
      </div>

      <form onSubmit={submit} className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} aria-hidden="true" />
            <input aria-label="Describe your career goal" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. I want to become a backend developer and crack product-company interviews" className="focus-ring min-h-11 w-full rounded-full border border-border bg-off-white py-3 pl-11 pr-4 text-base outline-none sm:text-sm" />
          </div>
          <Button type="submit" icon={SlidersHorizontal}>Find mentors</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <select aria-label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} className="min-h-11 rounded-full border border-border bg-off-white px-4 text-sm">
            <option value="">Any language</option><option>English</option><option>Hindi</option><option>Marathi</option>
          </select>
          <select aria-label="Budget" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} className="min-h-11 rounded-full border border-border bg-off-white px-4 text-sm">
            <option value="">Any budget</option><option value="500">Up to Rs. 500/hr</option><option value="600">Up to Rs. 600/hr</option><option value="700">Up to Rs. 700/hr</option>
          </select>
          <select aria-label="Minimum rating" value={minRating} onChange={(e) => setMinRating(e.target.value)} className="min-h-11 rounded-full border border-border bg-off-white px-4 text-sm">
            <option value="">Any rating</option><option value="4.5">4.5 and above</option><option value="4.7">4.7 and above</option>
          </select>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-text-dark">
            <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} /> Available now
          </label>
        </div>
      </form>

      <Tabs className="mb-6 w-fit" tabs={categories} active={category} onChange={setCategory} />

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
