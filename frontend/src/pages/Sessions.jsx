import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Download, ExternalLink, ListChecks, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { bookingApi } from "../services/platformApi";
import { useLanguage } from "../i18n";

const when = (iso) => new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function SessionCard({ booking, onChanged }) {
  const [prep, setPrep] = useState(null);
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const past = new Date(booking.startAt) < new Date();

  const run = async (name, fn) => {
    setBusy(name);
    setError("");
    try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(""); }
  };

  return (
    <Card elevated className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-bold text-dark-green">{booking.mentorName}</h2>
          <p className="text-sm text-text-muted">{when(booking.startAt)} · {booking.durationMin} min · {booking.topic}</p>
        </div>
        <span className="rounded-full bg-light-sage px-3 py-1 text-xs font-semibold text-dark-green">{booking.status}</span>
      </div>

      {booking.status !== "CANCELLED" && (
        <div className="flex flex-wrap gap-2">
          <a href={booking.googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex min-h-10 items-center gap-1 rounded-full border border-dark-green px-4 text-sm font-semibold text-dark-green hover:bg-light-sage">
            <ExternalLink size={14} aria-hidden="true" /> Google Calendar
          </a>
          <Button size="sm" variant="outline" icon={Download} onClick={() => run("ics", () => bookingApi.downloadIcs(booking.id))}>.ics file</Button>
          {!past && <Button size="sm" variant="subtle" icon={Sparkles} loading={busy === "prep"} onClick={() => run("prep", async () => setPrep(await bookingApi.prepare(booking.id)))}>Prepare with AI</Button>}
          {!past && booking.status === "CONFIRMED" && <Button size="sm" variant="ghost" onClick={() => run("cancel", async () => { await bookingApi.cancel(booking.id); onChanged(); })}>Cancel</Button>}
        </div>
      )}

      {prep && (
        <div className="rounded-xl bg-cream p-4 text-sm">
          <p className="font-semibold text-dark-green">Questions to ask</p>
          <ul className="mt-1 list-disc pl-5">{prep.questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
          <p className="mt-3 font-semibold text-dark-green">Bring</p>
          <ul className="mt-1 list-disc pl-5">{prep.bring.map((q, i) => <li key={i}>{q}</li>)}</ul>
          <p className="mt-3 font-semibold text-dark-green">Aim for</p>
          <ul className="mt-1 list-disc pl-5">{prep.goals.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </div>
      )}

      {booking.status !== "CANCELLED" && past && !booking.summary && !summary && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-dark">Paste your session notes to get a summary and follow-up tasks</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-cream p-3 text-sm" />
          <Button size="sm" icon={ListChecks} loading={busy === "sum"} disabled={!notes.trim()} onClick={() => run("sum", async () => { setSummary(await bookingApi.summarize(booking.id, notes)); onChanged(); })}>Summarise</Button>
        </div>
      )}

      {(summary || booking.summary) && (
        <div className="rounded-xl bg-light-sage p-4 text-sm">
          <p className="font-semibold text-dark-green">Session summary</p>
          <p className="mt-1">{summary?.summary || booking.summary}</p>
          {summary?.keyInsights?.length > 0 && <ul className="mt-2 list-disc pl-5">{summary.keyInsights.map((k, i) => <li key={i}>{k}</li>)}</ul>}
        </div>
      )}
      {error && <p className="text-sm text-coral">{error}</p>}
    </Card>
  );
}

export default function Sessions() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([bookingApi.mine(), bookingApi.tasks()])
      .then(([b, tk]) => { setBookings(b); setTasks(tk); })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const toggle = async (task) => {
    await bookingApi.setTaskDone(task.id, !task.done).catch(() => {});
    load();
  };

  return (
    <Layout>
      <p className="type-eyebrow">Mentoring</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-dark-green">{t("sessions.title")}</h1>
      {error && <p className="mt-4 text-sm text-coral">{error}</p>}
      {!bookings && !error && <Loader />}
      {bookings && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No sessions yet" description="Pick a mentor and book a time slot." action={<Button as={Link} to="/mentors">Find a mentor</Button>} />
            ) : bookings.map((b) => <SessionCard key={b.id} booking={b} onChanged={load} />)}
          </div>
          <Card elevated className="h-fit">
            <h2 className="type-section-title">Follow-up tasks</h2>
            {tasks.length === 0 && <p className="mt-3 text-sm text-text-muted">Tasks from your session summaries will appear here.</p>}
            <ul className="mt-3 space-y-2">
              {tasks.map((task) => (
                <li key={task.id}>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" checked={!!task.done} onChange={() => toggle(task)} className="mt-1" />
                    <span className={task.done ? "text-text-muted line-through" : "text-text-dark"}>{task.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </Layout>
  );
}
