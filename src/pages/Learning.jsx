import { useEffect, useState } from "react";
import { ExternalLink, GraduationCap, Award, FolderGit2 } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Tabs from "../components/Tabs";
import { progressApi } from "../services/platformApi";
import { useLanguage } from "../i18n";

const icons = { course: GraduationCap, certification: Award, project: FolderGit2 };
const NAMES = { "data-analyst": "Data Analyst", "software-developer": "Software Developer", "project-manager": "Project Manager", "product-manager": "Product Manager", "hr-specialist": "HR Specialist", "cybersecurity-analyst": "Cybersecurity" };

export default function Learning() {
  const { t } = useLanguage();
  const [careerId, setCareerId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    progressApi.learning(careerId).then((d) => { setData(d); if (!careerId && d.careerId) setCareerId(d.careerId); }).catch((e) => setError(e.message));
    // eslint-disable-next-line
  }, [careerId]);

  return (
    <Layout>
      <p className="type-eyebrow">Grow your skills</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-dark-green">{t("learning.title")}</h1>
      {error && <p className="mt-4 text-sm text-coral">{error}</p>}
      {!data && !error && <Loader />}
      {data && (
        <>
          <Tabs className="mt-5" active={careerId || data.careerId} onChange={setCareerId}
            tabs={data.careers.map((c) => ({ value: c, label: NAMES[c] || c }))} />
          {data.prioritySkills.length > 0 && (
            <p className="mt-4 text-sm text-text-dark">Listed first because your tracked skills are still low in: <strong>{data.prioritySkills.join(", ")}</strong>.</p>
          )}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {data.items.map((item, i) => {
              const Icon = icons[item.type] || GraduationCap;
              return (
                <Card key={i} elevated interactive className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-green"><Icon size={15} aria-hidden="true" /> {item.type}</div>
                  <h2 className="font-heading text-lg font-bold text-dark-green">{item.title}</h2>
                  <p className="text-sm text-text-muted">{item.provider} · {item.level} · {item.free ? "Free to learn" : "Paid / fee applies"}</p>
                  {item.skills && <p className="text-xs text-text-muted">Skills: {item.skills}</p>}
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-green hover:underline">Open <ExternalLink size={14} aria-hidden="true" /></a>}
                </Card>
              );
            })}
            {data.items.length === 0 && <p className="text-sm text-text-muted">No curated resources for this career yet.</p>}
          </div>
          <p className="mt-5 text-xs text-text-muted">{data.note}</p>
        </>
      )}
    </Layout>
  );
}
