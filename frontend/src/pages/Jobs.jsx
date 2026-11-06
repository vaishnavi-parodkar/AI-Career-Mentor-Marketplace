import { useEffect, useState } from "react";
import { Search, MapPin, ExternalLink, Briefcase } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Tabs from "../components/Tabs";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { jobsApi } from "../services/platformApi";
import { useLanguage } from "../i18n";

export default function Jobs() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [remote, setRemote] = useState(false);
  const [location, setLocation] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const run = (params) => {
    setLoading(true);
    setError("");
    jobsApi
      .search(params)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { run({ level }); /* eslint-disable-next-line */ }, [level]);

  const submit = (e) => {
    e.preventDefault();
    run({ q: query, level, remote: remote || undefined, location });
  };

  return (
    <Layout>
      <p className="type-eyebrow">Live openings</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-dark-green">{t("jobs.title")}</h1>
      <p className="mt-2 max-w-2xl type-supporting">
        Pulled live from free job boards (Arbeitnow, Jobicy, Himalayas, The Muse and Adzuna India when a key is set). Many roles are remote or global; always confirm details on the employer's page.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-[1fr_200px_auto_auto]">
        <label className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-off-white px-4">
          <Search size={16} aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Role, skill or company (e.g. java, data analyst)" className="w-full bg-transparent text-sm focus:outline-none" />
        </label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (India, remote...)" className="min-h-11 rounded-full border border-border bg-off-white px-4 text-sm" />
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-text-dark">
          <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} /> Remote only
        </label>
        <Button type="submit" icon={Search}>{t("common.search")}</Button>
      </form>

      <Tabs className="mt-5 w-fit" active={level} onChange={setLevel}
        tabs={[{ value: "all", label: t("jobs.all") }, { value: "fresher", label: t("jobs.fresher") }, { value: "experienced", label: t("jobs.experienced") }]} />

      {loading && <Loader label="Fetching current openings..." />}
      {error && <p className="mt-6 text-sm text-coral">{error}</p>}

      {!loading && data && (
        <>
          <p className="mt-5 text-sm text-text-muted">
            {data.total} jobs found{data.sources?.length ? ` from ${data.sources.join(", ")}` : ""}.
          </p>
          {data.jobs.length === 0 ? (
            <div className="mt-4"><EmptyState icon={Briefcase} title="No matching jobs" description="Try a broader search, remove filters, or check again later." /></div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {data.jobs.map((job) => (
                <Card key={job.id} elevated interactive className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-lg font-bold text-dark-green">{job.title}</h2>
                      <p className="text-sm font-semibold text-text-dark">{job.company}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-light-sage px-3 py-1 text-xs font-semibold capitalize text-dark-green">{job.level}</span>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-text-muted"><MapPin size={14} aria-hidden="true" /> {job.location}{job.remote ? " · Remote" : ""}</p>
                  {job.salary && <p className="text-sm text-text-dark">Salary: {job.salary}</p>}
                  {job.excerpt && <p className="line-clamp-3 text-sm text-text-muted">{job.excerpt}</p>}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xs text-text-muted">via {job.source}{job.postedAt ? ` · ${job.postedAt.slice(0, 10)}` : ""}</span>
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1 rounded-full text-sm font-semibold text-green hover:underline">
                      View job <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
