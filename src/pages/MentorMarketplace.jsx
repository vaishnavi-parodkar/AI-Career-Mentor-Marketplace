import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Layout from "../components/Layout";
import MentorCard from "../components/MentorCard";
import Tabs from "../components/Tabs";
import EmptyState from "../components/EmptyState";
import { mentorApi } from "../services/api";

const filters = [{ label: "All", value: "all" }, { label: "Tech", value: "tech" }, { label: "Business", value: "business" }, { label: "People", value: "people" }];
const categoryOf = (mentor) => ["software-developer-mentor", "cybersecurity-mentor", "hardware-engineer-mentor"].includes(mentor.id) ? "tech" : ["product-manager-mentor", "data-analyst-mentor"].includes(mentor.id) ? "business" : "people";

export default function MentorMarketplace() {
  const [mentors, setMentors] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => { mentorApi.getAll().then(setMentors); }, []);
  const filtered = useMemo(() => mentors.filter((mentor) => (filter === "all" || categoryOf(mentor) === filter) && (!query || mentor.name.toLowerCase().includes(query.toLowerCase()) || mentor.profession.toLowerCase().includes(query.toLowerCase()))), [mentors, query, filter]);

  return <Layout><div className="mb-7"><p className="type-eyebrow">Perspective when you need it</p><h1 className="mt-2 type-page-title">Mentor marketplace</h1><p className="mt-3 type-body">Chat with profession-specific AI mentors about skills, projects, and interview preparation.</p></div><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} aria-hidden="true" /><input aria-label="Search mentors" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or profession..." className="focus-ring min-h-11 w-full rounded-full border border-border bg-off-white py-3 pl-11 pr-4 text-base outline-none sm:text-sm" /></div><Tabs tabs={filters} active={filter} onChange={setFilter} /></div>{filtered.length === 0 ? <EmptyState icon={Search} title="No mentors found" description="Try a different search term or filter." /> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}</div>}</Layout>;
}
