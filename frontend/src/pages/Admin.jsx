import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Tabs from "../components/Tabs";
import Loader from "../components/Loader";
import { adminApi } from "../services/platformApi";
import { useAuth } from "../context/AuthContext";

const Stat = ({ label, value }) => (
  <Card elevated><p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p><p className="mt-1 font-heading text-3xl font-bold text-dark-green">{value ?? "-"}</p></Card>
);

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("monitor");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [form, setForm] = useState({ mentorId: "", title: "", body: "" });
  const [announce, setAnnounce] = useState({ title: "", message: "" });
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    adminApi.stats().then(setStats).catch((e) => setMsg(e.message));
    adminApi.users().then(setUsers).catch(() => {});
    adminApi.content().then(setContent).catch(() => {});
    adminApi.mentors().then(setMentors).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const act = async (fn, ok) => {
    setMsg("");
    try { await fn(); setMsg(ok); load(); } catch (e) { setMsg(e.message); }
  };

  return (
    <Layout>
      <p className="type-eyebrow">Administration</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-dark-green">Admin dashboard</h1>
      <Tabs className="mt-5 w-fit" active={tab} onChange={setTab}
        tabs={[{ value: "monitor", label: "Monitoring" }, { value: "users", label: "Users" }, { value: "content", label: "Mentor content" }, { value: "mentors", label: "Mentors" }, { value: "announce", label: "Announcements" }]} />
      {msg && <p className="mt-4 text-sm font-semibold text-green">{msg}</p>}
      {!stats && <Loader />}

      {stats && tab === "monitor" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Users" value={stats.users} /><Stat label="Mentors" value={stats.mentors} />
            <Stat label="Assessments" value={stats.assessments} /><Stat label="Roadmaps" value={stats.roadmaps} />
            <Stat label="Bookings" value={stats.bookings} /><Stat label="Interviews" value={stats.interviews} />
            <Stat label="Resume analyses" value={stats.resumeAnalyses} /><Stat label="Content to review" value={stats.pendingContent} />
          </div>
          <Card elevated>
            <h2 className="type-section-title">AI services (last 24 hours)</h2>
            <p className="mt-2 text-sm text-text-muted">{stats.aiCalls24h} calls · success rate {stats.aiSuccessRate24h ?? "-"}% · average latency {stats.aiAvgLatencyMs24h ?? "-"} ms</p>
            <table className="mt-4 w-full text-left text-sm">
              <thead><tr className="text-text-muted"><th className="py-1">Provider</th><th>Model</th><th>OK</th><th>Failed</th><th>Status</th></tr></thead>
              <tbody>{stats.aiProviders.map((p) => (
                <tr key={p.name} className="border-t border-border"><td className="py-2 font-semibold">{p.name}</td><td>{p.model}</td><td>{p.successes}</td><td>{p.failures}</td><td>{p.coolingDown ? "cooling down" : "ready"}</td></tr>
              ))}</tbody>
            </table>
            {stats.aiProviders.length === 0 && <p className="mt-3 text-sm text-coral">No AI provider is configured. Add at least one API key in the backend environment.</p>}
            {stats.recentAiErrors.length > 0 && (
              <div className="mt-4 text-xs text-text-muted">
                <p className="font-semibold">Recent errors</p>
                {stats.recentAiErrors.map((e, i) => <p key={i}>{e.at.slice(0, 19)} · {e.provider} · {e.feature} · {e.error}</p>)}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "users" && (
        <Card elevated className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-text-muted"><th className="py-1">Name</th><th>Email</th><th>Role</th><th /></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.id} className="border-t border-border"><td className="py-2">{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                <td>{u.id !== user.id && <Button size="sm" variant="outline" onClick={() => act(() => adminApi.setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN"), "Role updated")}>{u.role === "ADMIN" ? "Make user" : "Make admin"}</Button>}</td></tr>
            ))}</tbody>
          </table>
        </Card>
      )}

      {tab === "content" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {content.map((c) => (
              <Card key={c.id} elevated>
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-xs text-text-muted">{c.mentorName}</p><h3 className="font-semibold text-dark-green">{c.title}</h3></div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.approved ? "bg-light-sage text-dark-green" : "bg-coral/20 text-coral"}`}>{c.approved ? "approved" : "pending"}</span>
                </div>
                <p className="mt-2 text-sm text-text-muted">{c.body}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => act(() => adminApi.setApproved(c.id, !c.approved), "Updated")}>{c.approved ? "Unapprove" : "Approve"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => act(() => adminApi.deleteContent(c.id), "Deleted")}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
          <Card elevated className="h-fit space-y-3">
            <h2 className="type-section-title">Add approved content</h2>
            <p className="text-xs text-text-muted">Mentor chat answers from approved notes only.</p>
            <select value={form.mentorId} onChange={(e) => setForm({ ...form, mentorId: e.target.value })} className="min-h-11 w-full rounded-xl border border-border bg-cream px-3 text-sm">
              <option value="">Choose mentor</option>
              {mentors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="min-h-11 w-full rounded-xl border border-border bg-cream px-3 text-sm" />
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={5} placeholder="Mentor-provided advice or notes" className="w-full rounded-xl border border-border bg-cream p-3 text-sm" />
            <Button fullWidth onClick={() => act(async () => { await adminApi.addContent({ ...form, mentorId: Number(form.mentorId), approved: true }); setForm({ mentorId: "", title: "", body: "" }); }, "Content added")}>Add</Button>
          </Card>
        </div>
      )}

      {tab === "mentors" && (
        <Card elevated className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-text-muted"><th className="py-1">Name</th><th>Specialisation</th><th>Rate (Rs./hr)</th><th>Available</th><th /></tr></thead>
            <tbody>{mentors.map((m) => (
              <tr key={m.id} className="border-t border-border"><td className="py-2">{m.name}</td><td>{m.specialization}</td><td>{m.hourlyRate}</td><td>{m.available ? "Yes" : "No"}</td>
                <td><Button size="sm" variant="outline" onClick={() => act(() => adminApi.updateMentor(m.id, { ...m, available: !m.available }), "Mentor updated")}>{m.available ? "Mark unavailable" : "Mark available"}</Button></td></tr>
            ))}</tbody>
          </table>
        </Card>
      )}

      {tab === "announce" && (
        <Card elevated className="mt-6 max-w-lg space-y-3">
          <h2 className="type-section-title">Send an announcement to every user</h2>
          <input value={announce.title} onChange={(e) => setAnnounce({ ...announce, title: e.target.value })} placeholder="Title" className="min-h-11 w-full rounded-xl border border-border bg-cream px-3 text-sm" />
          <textarea value={announce.message} onChange={(e) => setAnnounce({ ...announce, message: e.target.value })} rows={4} placeholder="Message" className="w-full rounded-xl border border-border bg-cream p-3 text-sm" />
          <Button onClick={() => act(() => adminApi.broadcast(announce.title, announce.message), "Announcement sent")}>Send</Button>
        </Card>
      )}
    </Layout>
  );
}
