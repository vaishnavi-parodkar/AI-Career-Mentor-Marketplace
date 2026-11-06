import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, BadgeCheck, Briefcase, GraduationCap, Lightbulb, Mic2, LineChart, CalendarPlus } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import { mentorApi } from "../services/api";
import { bookingApi } from "../services/platformApi";

const topicIcons = { "Career Guidance": Briefcase, "Skill Development": GraduationCap, "Project Idea": Lightbulb, "Project Ideas": Lightbulb, "Interview Preparation": Mic2, "Industry Insight": LineChart };

export default function MentorDetail() {
  const { mentor: mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState("");
  const [topic, setTopic] = useState("Career guidance");
  const [goal, setGoal] = useState("");
  const [booking, setBooking] = useState({ busy: false, error: "", done: null });

  useEffect(() => {
    let active = true;
    mentorApi.getById(mentorId).then((data) => {
      if (!active) return;
      setMentor(data);
      setLoading(false);
      if (data?.dbId) bookingApi.slots(data.dbId).then((s) => active && setSlots(s)).catch(() => {});
    });
    return () => { active = false; };
  }, [mentorId]);

  const book = async () => {
    setBooking({ busy: true, error: "", done: null });
    try {
      const done = await bookingApi.book({ mentorId: mentor.dbId, startAt: slot, topic, goal });
      setBooking({ busy: false, error: "", done });
      setSlots(await bookingApi.slots(mentor.dbId));
      setSlot("");
    } catch (e) {
      setBooking({ busy: false, error: e.message, done: null });
    }
  };

  if (loading) return <Layout><Loader label="Loading mentor..." /></Layout>;
  if (!mentor) return <Layout><p className="py-12 text-center type-supporting">Mentor not found.</p></Layout>;

  const days = [...new Set(slots.map((s) => s.label.split(",")[0]))];

  return (
    <Layout>
      <div className="mb-5"><BackButton to="/mentors" /></div>
      <div className="mx-auto max-w-2xl">
        <Card className="mb-6 flex flex-col items-center gap-4 py-9 text-center" elevated>
          <Avatar name={mentor.name} color={mentor.avatarColor} size={84} />
          <p className="type-eyebrow">Profession-specific guidance</p>
          <h1 className="font-heading text-3xl font-bold text-dark-green">{mentor.name}</h1>
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-light-sage px-3 py-1 text-sm font-semibold text-dark-green"><BadgeCheck size={15} aria-hidden="true" /> AI mentor · {mentor.profession}</span>
          <p className="mt-2 max-w-md type-supporting">{mentor.bio || mentor.description}</p>
          {mentor.skills?.length > 0 && <div className="flex flex-wrap justify-center gap-2">{mentor.skills.map((s) => <span key={s} className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-dark">{s}</span>)}</div>}
          <p className="text-sm text-text-muted">{[mentor.yearsExperience && `${mentor.yearsExperience}+ yrs`, mentor.hourlyRate && `Rs. ${mentor.hourlyRate}/hr`, mentor.languages?.join(", ")].filter(Boolean).join(" · ")}</p>
        </Card>

        <Card className="mb-6" elevated>
          <p className="type-eyebrow">Topics</p>
          <h2 className="mt-2 type-section-title">What I can help you with</h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mentor.topics.map((topicName) => { const Icon = topicIcons[topicName] || Lightbulb; return <div key={topicName} className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-cream px-4 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-light-sage text-dark-green"><Icon size={17} aria-hidden="true" /></span><span className="text-base font-medium text-text-dark">{topicName}</span></div>; })}
          </div>
        </Card>

        {mentor.knowledge?.length > 0 && (
          <Card className="mb-6" elevated>
            <h2 className="type-section-title">Approved mentor notes</h2>
            <p className="mt-1 text-xs text-text-muted">The chat assistant uses these notes when answering.</p>
            <div className="mt-3 space-y-3">{mentor.knowledge.map((k, i) => <div key={i} className="rounded-xl bg-cream p-3 text-sm"><p className="font-semibold text-dark-green">{k.title}</p><p className="mt-1 text-text-muted">{k.body}</p></div>)}</div>
          </Card>
        )}

        {mentor.dbId && (
          <Card className="mb-6" elevated>
            <h2 className="type-section-title">Book a 45-minute session</h2>
            {days.length === 0 ? <p className="mt-3 text-sm text-text-muted">No open slots in the next 7 days.</p> : (
              <>
                {days.map((day) => (
                  <div key={day} className="mt-4">
                    <p className="text-sm font-semibold text-text-dark">{day}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {slots.filter((s) => s.label.startsWith(day)).map((s) => (
                        <button key={s.startAt} type="button" disabled={s.taken} onClick={() => setSlot(s.startAt)} className={`focus-ring min-h-10 rounded-full border px-3 text-sm font-semibold ${s.taken ? "border-border text-text-muted line-through opacity-50" : slot === s.startAt ? "border-dark-green bg-dark-green text-off-white" : "border-border text-dark-green hover:bg-light-sage"}`}>
                          {s.label.split(", ")[1]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-4 min-h-11 w-full rounded-xl border border-border bg-cream px-3 text-sm" aria-label="Topic" />
                <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} placeholder="What do you want out of this session?" className="mt-3 w-full rounded-xl border border-border bg-cream p-3 text-sm" />
                {booking.error && <p className="mt-2 text-sm text-coral">{booking.error}</p>}
                <Button className="mt-4" icon={CalendarPlus} disabled={!slot} loading={booking.busy} onClick={book}>Confirm booking</Button>
              </>
            )}
            {booking.done && (
              <div className="mt-4 rounded-xl bg-light-sage p-4 text-sm">
                <p className="font-semibold text-dark-green">Booked.</p>
                <p className="mt-1">Add it to your calendar: <a className="font-semibold text-green underline" href={booking.done.googleCalendarUrl} target="_blank" rel="noopener noreferrer">Google Calendar</a>, or open <button type="button" className="font-semibold text-green underline" onClick={() => navigate("/sessions")}>My sessions</button> for the .ics file and AI preparation.</p>
              </div>
            )}
          </Card>
        )}

        <Button variant="primary" size="lg" fullWidth icon={MessageCircle} onClick={() => navigate(`/mentors/${mentor.id}/chat`)}>Start chat</Button>
      </div>
    </Layout>
  );
}
