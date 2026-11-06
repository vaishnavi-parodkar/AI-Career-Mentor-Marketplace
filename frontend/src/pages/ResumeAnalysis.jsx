import { useEffect, useState } from "react";
import { FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { resumeApi } from "../services/platformApi";
import { careerApi } from "../services/api";
import { useLanguage } from "../i18n";

const Bar = ({ label, value }) => (
  <div>
    <div className="mb-1 flex justify-between text-xs font-semibold text-text-dark"><span>{label}</span><span>{value}%</span></div>
    <div className="h-2 rounded-full bg-light-sage"><div className="h-2 rounded-full bg-dark-green" style={{ width: `${value}%` }} /></div>
  </div>
);

export default function ResumeAnalysis() {
  const { t } = useLanguage();
  const [careers, setCareers] = useState([]);
  const [careerId, setCareerId] = useState("");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    careerApi.getAll?.().then((list) => setCareers(Array.isArray(list) ? list : [])).catch(() => {});
    resumeApi.history().then(setHistory).catch(() => {});
  }, []);

  const analyze = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await resumeApi.analyze({ file, text, careerId, jobDescription: jd });
      setResult(data);
      resumeApi.history().then(setHistory).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <p className="type-eyebrow">ATS check</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-dark-green">{t("resume.title")}</h1>
      <p className="mt-2 max-w-2xl type-supporting">Upload a PDF, DOCX or TXT resume. Scores, keywords and sections are calculated on the server; AI is only used to word the suggestions.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card elevated>
          <form onSubmit={analyze} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-text-dark">Target role</span>
              <select value={careerId} onChange={(e) => setCareerId(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-cream px-3 text-sm">
                <option value="">Not specified</option>
                {careers.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text-dark">Resume file</span>
              <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text-dark">...or paste the text</span>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-border bg-cream p-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text-dark">Job description (optional)</span>
              <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={3} placeholder="Paste a job description to match keywords against it" className="mt-1 w-full rounded-xl border border-border bg-cream p-3 text-sm" />
            </label>
            {error && <p className="text-sm text-coral">{error}</p>}
            <Button type="submit" fullWidth icon={Upload} loading={busy}>Analyse resume</Button>
          </form>
          {history.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm font-semibold text-text-dark">Previous analyses</p>
              <ul className="mt-2 space-y-1 text-sm text-text-muted">
                {history.map((h) => <li key={h.id}>{h.createdAt.slice(0, 10)} · {h.fileName} · ATS {h.atsScore}</li>)}
              </ul>
            </div>
          )}
        </Card>

        <div className="space-y-5">
          {!result && <Card className="flex items-center gap-3 text-text-muted"><FileText aria-hidden="true" /> Your results will appear here.</Card>}
          {result && (
            <>
              <Card elevated>
                <p className="type-eyebrow">ATS score</p>
                <p className="mt-1 font-heading text-5xl font-bold text-dark-green">{result.atsScore}<span className="text-xl text-text-muted"> / 100</span></p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Bar label="Keyword match" value={result.breakdown.keywords} />
                  <Bar label="Sections" value={result.breakdown.sections} />
                  <Bar label="Contact details" value={result.breakdown.contact} />
                  <Bar label="Length" value={result.breakdown.length} />
                  <Bar label="Measurable results" value={result.breakdown.measurableResults} />
                </div>
              </Card>
              <Card elevated>
                <h2 className="type-section-title">Keywords</h2>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-green"><CheckCircle2 size={16} aria-hidden="true" /> Found</p>
                <div className="mt-2 flex flex-wrap gap-2">{result.matchedKeywords.length ? result.matchedKeywords.map((k) => <span key={k} className="rounded-full bg-light-sage px-3 py-1 text-xs font-semibold text-dark-green">{k}</span>) : <span className="text-sm text-text-muted">None of the target keywords yet.</span>}</div>
                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-coral"><AlertCircle size={16} aria-hidden="true" /> Missing</p>
                <div className="mt-2 flex flex-wrap gap-2">{result.missingKeywords.length ? result.missingKeywords.map((k) => <span key={k} className="rounded-full border border-coral px-3 py-1 text-xs font-semibold text-coral">{k}</span>) : <span className="text-sm text-text-muted">Nothing missing.</span>}</div>
                <p className="mt-4 text-sm font-semibold text-text-dark">Skills detected in your resume</p>
                <p className="mt-1 text-sm text-text-muted">{result.extractedSkills.join(", ") || "None detected."}</p>
              </Card>
              <Card elevated>
                <h2 className="type-section-title">Suggestions {result.suggestionSource === "ai" ? "(AI)" : "(rule-based)"}</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-dark">{result.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
