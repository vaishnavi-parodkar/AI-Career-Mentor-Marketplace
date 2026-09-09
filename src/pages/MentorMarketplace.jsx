import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Layout from "../components/Layout";
import MentorCard from "../components/MentorCard";
import Tabs from "../components/Tabs";
import EmptyState from "../components/EmptyState";
import { mentorApi } from "../services/api";

const filters = [
  { label: "All", value: "all" },
  { label: "Tech", value: "tech" },
  { label: "Business", value: "business" },
  { label: "People", value: "people" },
];

const categoryOf = (mentor) => {
  if (["software-developer-mentor", "cybersecurity-mentor", "hardware-engineer-mentor"].includes(mentor.id))
    return "tech";
  if (["product-manager-mentor", "data-analyst-mentor"].includes(mentor.id)) return "business";
  return "people";
};

export default function MentorMarketplace() {
  const [mentors, setMentors] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    mentorApi.getAll().then(setMentors);
  }, []);

  const filtered = useMemo(() => {
    return mentors.filter((m) => {
      const matchesFilter = filter === "all" || categoryOf(m) === filter;
      const matchesQuery =
        !query ||
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.profession.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [mentors, query, filter]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">AI Mentor Marketplace</h1>
        <p className="text-sm text-text-muted">Chat with AI mentors modeled on real career paths.</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mentors by name or profession..."
            className="w-full rounded-full border border-border bg-off-white py-3 pl-11 pr-4 text-sm outline-none focus:border-dark-green"
          />
        </div>
        <Tabs tabs={filters} active={filter} onChange={setFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No mentors found"
          description="Try a different search term or filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MentorCard key={m.id} mentor={m} />
          ))}
        </div>
      )}
    </Layout>
  );
}
