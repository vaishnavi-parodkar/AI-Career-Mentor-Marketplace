import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Check, Pencil, Sparkles, Mail, CircleDashed } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import Logo from "../components/Logo";
import ProgressBar from "../components/ProgressBar";
import { profileApi, roadmapApi } from "../services/api";
import { interviewApi } from "../services/interviewApi";
import BadgeShelf from "../components/BadgeShelf";
import { computeBadges } from "../utils/badges";
import { useAuth } from "../context/AuthContext";
import { getProfileCompletion } from "../utils/profile";

const STEPS = ["Education", "Skills & experience", "Interests", "Goals"];
const statusOptions = ["Student", "Recent graduate", "Working professional", "Between jobs", "Switching careers"];
const experienceOptions = ["No experience yet", "Less than 1 year", "1-3 years", "3-5 years", "5+ years"];
const suggestedSkills = ["Python", "JavaScript", "Java", "SQL", "React", "Excel", "Communication", "Problem solving", "Leadership", "Data analysis", "Figma", "Project management"];
const emptyForm = { qualification: "", field: "", gradYear: "", skills: [], currentStatus: "", experienceLevel: "", targetRole: "", about: "", interests: [], goal: "" };
const qualifications = ["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD"];
const interestOptions = ["Technology", "Business", "Design", "Healthcare", "Data & Analytics", "People & HR"];
const goalOptions = ["Land my first job", "Switch careers", "Get promoted", "Explore options"];

const formatName = (name = "") => name
  .trim()
  .toLocaleLowerCase()
  .replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase());

const formatValue = (value = "") => value
  .trim()
  .split(/(\s+)/)
  .map((word, index) => {
    if (!word.trim()) return word;
    if (/^[A-Z0-9&]+$/.test(word) && /[A-Z]/.test(word)) return word;
    const lower = word.toLocaleLowerCase();
    if (["ai", "hr", "it", "ui", "ux", "us", "uk"].includes(lower)) return lower.toLocaleUpperCase();
    if (index > 0 && ["and", "of", "my", "to", "for"].includes(lower)) return lower;
    return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
  })
  .join("");

const currentYear = new Date().getFullYear();

export default function CareerProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [singleSection, setSingleSection] = useState(false); // editing one section from the profile page
  const [visible, setVisible] = useState(false);

  const completion = getProfileCompletion(form);

  // Badge inputs: roadmaps come from the backend, interview history from local storage.
  const [roadmaps, setRoadmaps] = useState([]);
  useEffect(() => {
    if (!Number.isInteger(user?.id) || user.id <= 0) return undefined;
    let active = true;
    roadmapApi.getByUser(user.id).then((res) => {
      if (active && res?.success && Array.isArray(res.roadmaps)) setRoadmaps(res.roadmaps);
    });
    return () => { active = false; };
  }, [user?.id]);
  const badges = computeBadges({
    completion,
    roadmaps,
    interviews: interviewApi.getHistory(user?.id),
  });

  useEffect(() => {
    let active = true;
    setVisible(true);
    profileApi.getProfile().then((response) => {
      if (!active) return;
      if (response.success && response.profile) {
        const loaded = { ...emptyForm, ...response.profile };
        setForm(loaded);
        // A brand-new or half-finished profile goes straight into setup instead of an empty page.
      } else if (response.message && !response.message.toLowerCase().includes("profile not found")) {
        setError(response.message);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const addSkill = (raw) => {
    const skill = raw.trim().replace(/\s+/g, " ");
    if (!skill) return;
    setForm((current) => current.skills.some((item) => item.toLowerCase() === skill.toLowerCase()) || current.skills.length >= 30 ? current : { ...current, skills: [...current.skills, skill] });
    setSkillInput("");
  };
  const removeSkill = (skill) => setForm((current) => ({ ...current, skills: current.skills.filter((item) => item !== skill) }));

  const toggleInterest = (interest) => setForm((current) => ({ ...current, interests: current.interests.includes(interest) ? current.interests.filter((item) => item !== interest) : [...current.interests, interest] }));

  const gradYearError = () => {
    if (!form.gradYear) return "";
    const year = Number(form.gradYear);
    return Number.isInteger(year) && year >= 2000 && year <= 2100 ? "" : "Enter a graduation year between 2000 and 2100.";
  };

  // Saves whatever is filled in so far. Nothing here requires a complete profile.
  const persist = async () => {
    const yearProblem = gradYearError();
    if (yearProblem) { setError(yearProblem); return false; }
    setSaving(true);
    const response = await profileApi.saveProfile(form);
    setSaving(false);
    if (!response.success) {
      setError(response.message || "We could not save your profile. Please try again.");
      return false;
    }
    return true;
  };

  const hasAnyData = () => completion.sections.some((section) => section.complete) || form.about || form.targetRole || form.skills.length || form.interests.length || form.qualification || form.field || form.gradYear || form.goal || form.currentStatus || form.experienceLevel;

  const startSetup = (fromStep, single = false) => {
    setError("");
    setNotice("");
    setSingleSection(single);
    setStep(fromStep);
    setEditing(true);
    window.scrollTo({ top: 0 });
  };

  const backToOverview = (message = "") => {
    setEditing(false);
    setSingleSection(false);
    setNotice(message);
    window.scrollTo({ top: 0 });
  };

  const handleSaveExit = async () => {
    setError("");
    if (!hasAnyData()) { navigate("/home"); return; }
    if (await persist()) navigate("/home");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.qualification || !form.field.trim() || !form.gradYear) return "Please fill in all fields to continue.";
      return gradYearError();
    }
    if (step === 1 && (form.skills.length === 0 || !form.currentStatus || !form.experienceLevel)) return "Add at least one skill and tell us your current status and experience.";
    if (step === 2 && form.interests.length === 0) return "Select at least one area of interest.";
    if (step === 3 && !form.goal) return "Please select a goal to continue.";
    return "";
  };

  const handleNext = async () => {
    setError("");
    const problem = validateStep();
    if (problem) { setError(problem); return; }
    // Progress is saved at every step, so leaving halfway never loses what was entered.
    if (!(await persist())) return;
    if (singleSection || step === STEPS.length - 1) {
      const done = getProfileCompletion(form).isComplete;
      backToOverview(singleSection ? "Changes saved." : done ? "Your profile is complete. You can edit any section whenever you like." : "Progress saved.");
      return;
    }
    setStep((current) => current + 1);
  };

  const displayName = formatName(user?.fullName || "");
  const profileInitial = displayName.charAt(0).toLocaleUpperCase() || "Y";
  const profileTitle = displayName ? `${displayName}'s profile` : "Your profile";
  const fieldLabelClass = "text-xs font-semibold uppercase tracking-[0.12em] text-text-muted";
  const fieldValueClass = "mt-2 text-base font-medium leading-7 text-text-dark sm:text-lg";

  return (
    <div className="min-h-screen bg-cream">
      <header className="mx-auto flex min-h-20 w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo to="/" />
        <button type="button" onClick={handleSaveExit} disabled={saving} className="focus-ring min-h-11 rounded-full px-4 text-sm font-semibold text-text-muted transition-colors duration-150 hover:bg-light-sage hover:text-dark-green active:scale-[0.98]">Save &amp; exit</button>
      </header>
      <main className={`mx-auto w-full px-4 pb-16 pt-8 transition-opacity duration-500 motion-reduce:transition-none sm:px-6 sm:pt-12 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className={`mx-auto ${editing ? "max-w-lg" : "max-w-3xl"}`}>
        {loading ? <p className="py-16 text-center text-text-muted" role="status">Loading your profile…</p> : !editing ? <>
          <p className="type-eyebrow">{completion.isComplete ? "Your Pathwise details" : "Welcome to Pathwise"}</p>
          <div className="mt-3 flex items-center gap-4">
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dark-green font-heading text-xl font-bold text-off-white">{profileInitial}</span>
            <div className="min-w-0">
              <h1 className="type-page-title">{completion.isComplete ? profileTitle : displayName ? `Hi ${displayName.split(" ")[0]}, let’s finish your profile` : "Let’s finish your profile"}</h1>
              {user?.email && <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-text-muted"><Mail size={14} aria-hidden="true" />{user.email}</p>}
            </div>
          </div>

          <Card elevated className="mt-8 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="type-meta">Profile completion</p>
                <p className="font-heading text-4xl font-bold text-dark-green">{completion.percent}%</p>
              </div>
              <p className="max-w-[16rem] text-right text-sm leading-6 text-text-muted">{completion.isComplete ? "All set. Your matches and practice sessions use these details." : `${completion.sections.filter((x) => x.complete).length} of ${completion.sections.length} sections done. A fuller profile gives sharper matches.`}</p>
            </div>
            <ProgressBar value={completion.percent} max={100} className="mt-4" height="h-2.5" label="Profile completion" color={completion.isComplete ? "bg-green" : "bg-sage"} />
            <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {completion.sections.map((section) => (
                <li key={section.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${section.complete ? "bg-light-sage text-dark-green" : "border border-dashed border-border text-text-muted"}`}>
                  {section.complete ? <Check size={15} aria-hidden="true" /> : <CircleDashed size={15} aria-hidden="true" />}{section.label}
                </li>
              ))}
            </ol>
          </Card>

          <BadgeShelf badges={badges} />

          {notice && <p className="mt-4 rounded-xl bg-light-sage px-4 py-3 text-sm font-semibold text-dark-green" role="status">{notice}</p>}
          {error && <p className="mt-4 text-sm font-medium text-coral" role="alert">{error}</p>}

          {!completion.isComplete && (
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-dark-green/20 bg-light-sage/60 p-5 sm:flex-row sm:items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dark-green text-off-white"><Sparkles size={20} aria-hidden="true" /></span>
              <p className="flex-1 text-base leading-7 text-text-dark"><span className="font-semibold">{completion.percent <= 20 ? "Your profile is just getting started." : "You’re partway there."}</span> It takes about two minutes to finish, and you can edit it any time later.</p>
              <Button variant="primary" onClick={() => startSetup(completion.nextStep ?? 0)}>{completion.percent <= 20 ? "Set up my profile" : "Continue setup"}</Button>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4">
            {completion.sections.map((section) => (
              <Card key={section.id} elevated={section.complete} className={`p-5 sm:p-6 ${section.complete ? "" : "border-dashed bg-cream"}`}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-heading text-xl font-bold text-dark-green">{section.label}</h2>
                  <Button variant={section.complete ? "outline" : "subtle"} size="sm" icon={section.complete ? Pencil : Plus} onClick={() => startSetup(section.step, true)} aria-label={`${section.complete ? "Edit" : "Add"} ${section.label}`}>{section.complete ? "Edit" : "Add"}</Button>
                </div>
                {section.id === "education" && (section.complete
                  ? <dl className="mt-4 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-3"><div className="min-w-0"><dt className={fieldLabelClass}>Highest qualification</dt><dd className={fieldValueClass}>{formatValue(form.qualification)}</dd></div><div className="min-w-0"><dt className={fieldLabelClass}>Field of study</dt><dd className={fieldValueClass}>{formatValue(form.field)}</dd></div><div className="min-w-0"><dt className={fieldLabelClass}>Graduation year</dt><dd className={fieldValueClass}>{form.gradYear}</dd></div></dl>
                  : <p className="mt-2 text-sm text-text-muted">Your qualification, field of study and graduation year.</p>)}
                {section.id === "skills" && (section.complete
                  ? <dl className="mt-4 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
                      <div className="col-span-1 min-w-0 sm:col-span-2"><dt className={fieldLabelClass}>Skills</dt><dd className="mt-3 flex flex-wrap gap-2">{form.skills.map((skill) => <span key={skill} className="rounded-full border border-dark-green/10 bg-light-sage px-3 py-1.5 text-sm font-semibold text-dark-green">{skill}</span>)}</dd></div>
                      <div className="min-w-0"><dt className={fieldLabelClass}>Current status</dt><dd className={fieldValueClass}>{form.currentStatus}</dd></div>
                      <div className="min-w-0"><dt className={fieldLabelClass}>Experience</dt><dd className={fieldValueClass}>{form.experienceLevel}</dd></div>
                      {form.targetRole && <div className="min-w-0"><dt className={fieldLabelClass}>Target role</dt><dd className={fieldValueClass}>{form.targetRole}</dd></div>}
                      {form.about && <div className="col-span-1 min-w-0 sm:col-span-2"><dt className={fieldLabelClass}>About</dt><dd className={fieldValueClass}>{form.about}</dd></div>}
                    </dl>
                  : <p className="mt-2 text-sm text-text-muted">Skills, current status and work experience. This powers your skill-gap analysis.</p>)}
                {section.id === "interests" && (section.complete
                  ? <div className="mt-4 flex flex-wrap gap-2">{form.interests.map((interest) => <span key={interest} className="rounded-full border border-dark-green/10 bg-light-sage px-3 py-1.5 text-sm font-semibold text-dark-green">{formatValue(interest)}</span>)}</div>
                  : <p className="mt-2 text-sm text-text-muted">The areas of work you’re curious about.</p>)}
                {section.id === "goals" && (section.complete
                  ? <p className={fieldValueClass}>{formatValue(form.goal)}</p>
                  : <p className="mt-2 text-sm text-text-muted">What you want out of Pathwise right now.</p>)}
              </Card>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button variant={completion.isComplete ? "primary" : "outline"} size="lg" fullWidth onClick={() => navigate("/home")}>{completion.isComplete ? "Continue to home" : "Skip for now"}</Button>
          </div>
        </> : <>
        <p className="type-eyebrow">{singleSection ? "Update your details" : "A little context helps"}</p>
        <h1 className="mt-2 type-page-title">{singleSection ? `Edit ${STEPS[step].toLowerCase()}` : completion.percent <= 20 ? "Let’s build your career profile" : "Complete your career profile"}</h1>
        <p className="mt-3 type-supporting">This gives your assessment and career exploration more useful context.</p>
        {!singleSection && <div className="mb-8 mt-8"><div className="mb-3 flex justify-between text-sm font-semibold text-text-muted"><span>Step {step + 1} of {STEPS.length}: {STEPS[step]}</span><span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span></div><ProgressBar value={step + 1} max={STEPS.length} label="Setup progress" /></div>}
        {singleSection && <div className="mt-8" />}

        {step === 0 && <div className="flex flex-col gap-5"><div><label htmlFor="qualification" className="mb-2 block text-sm font-semibold text-text-dark">Highest qualification</label><select id="qualification" value={form.qualification} onChange={(e) => setForm((current) => ({ ...current, qualification: e.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-border bg-off-white px-4 py-3 text-base text-text-dark outline-none sm:text-sm"><option value="">Select qualification</option>{qualifications.map((qualification) => <option key={qualification} value={qualification}>{qualification}</option>)}</select></div><Input label="Field of study" placeholder="e.g. Computer Engineering" value={form.field} onChange={(e) => setForm((current) => ({ ...current, field: e.target.value }))} /><Input label="Graduation year" type="number" placeholder="e.g. 2027" value={form.gradYear} onChange={(e) => setForm((current) => ({ ...current, gradYear: e.target.value }))} /></div>}
        {step === 1 && <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="skill-input" className="mb-2 block text-sm font-semibold text-text-dark">Your skills</label>
            <div className="flex gap-2">
              <input id="skill-input" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); } }} maxLength={40} placeholder="Type a skill and press Enter" className="focus-ring min-h-11 w-full rounded-xl border border-border bg-off-white px-4 py-3 text-base text-text-dark outline-none sm:text-sm" />
              <Button type="button" variant="outline" icon={Plus} onClick={() => addSkill(skillInput)} aria-label="Add skill">Add</Button>
            </div>
            {form.skills.length > 0 && <ul className="mt-3 flex flex-wrap gap-2" aria-label="Your skills">{form.skills.map((skill) => <li key={skill}><span className="inline-flex items-center gap-1.5 rounded-full border border-dark-green/10 bg-light-sage py-1.5 pl-3 pr-2 text-sm font-semibold text-dark-green">{skill}<button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`} className="focus-ring flex h-5 w-5 items-center justify-center rounded-full hover:bg-dark-green/10"><X size={13} aria-hidden="true" /></button></span></li>)}</ul>}
            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Quick add</p>
            <div className="flex flex-wrap gap-2">{suggestedSkills.filter((skill) => !form.skills.some((item) => item.toLowerCase() === skill.toLowerCase())).map((skill) => <button key={skill} type="button" onClick={() => addSkill(skill)} className="focus-ring min-h-9 rounded-full border border-border bg-off-white px-3 text-sm font-medium text-text-dark transition-colors hover:bg-light-sage/40">+ {skill}</button>)}</div>
          </div>
          <div><label htmlFor="currentStatus" className="mb-2 block text-sm font-semibold text-text-dark">Current status</label><select id="currentStatus" value={form.currentStatus} onChange={(e) => setForm((current) => ({ ...current, currentStatus: e.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-border bg-off-white px-4 py-3 text-base text-text-dark outline-none sm:text-sm"><option value="">Select status</option>{statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
          <div><label htmlFor="experienceLevel" className="mb-2 block text-sm font-semibold text-text-dark">Work experience</label><select id="experienceLevel" value={form.experienceLevel} onChange={(e) => setForm((current) => ({ ...current, experienceLevel: e.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-border bg-off-white px-4 py-3 text-base text-text-dark outline-none sm:text-sm"><option value="">Select experience</option>{experienceOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
          <Input label="Target role (optional)" placeholder="e.g. Data Analyst" maxLength={150} value={form.targetRole} onChange={(e) => setForm((current) => ({ ...current, targetRole: e.target.value }))} />
          <div><label htmlFor="about" className="mb-2 block text-sm font-semibold text-text-dark">About you (optional)</label><textarea id="about" rows={3} maxLength={1000} value={form.about} onChange={(e) => setForm((current) => ({ ...current, about: e.target.value }))} placeholder="Projects, internships, achievements, anything that shows what you can do." className="focus-ring w-full resize-y rounded-xl border border-border bg-off-white px-4 py-3 text-base text-text-dark outline-none placeholder:text-text-muted sm:text-sm" /></div>
        </div>}
        {step === 2 && <div><p className="mb-4 text-base font-semibold text-text-dark">Which areas interest you most? <span className="font-normal text-text-muted">Select all that apply.</span></p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{interestOptions.map((interest) => <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`focus-ring min-h-12 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${form.interests.includes(interest) ? "border-dark-green bg-light-sage text-dark-green" : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"}`}>{interest}</button>)}</div></div>}
        {step === 3 && <div><p className="mb-4 text-base font-semibold text-text-dark">What&apos;s your main goal right now?</p><div className="flex flex-col gap-3">{goalOptions.map((goal) => <button key={goal} type="button" onClick={() => setForm((current) => ({ ...current, goal }))} className={`focus-ring min-h-12 rounded-xl border px-4 py-3 text-left text-base font-semibold transition-colors ${form.goal === goal ? "border-dark-green bg-light-sage text-dark-green" : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"}`}>{goal}</button>)}</div></div>}
        {error && <p className="mt-5 text-sm font-medium text-coral" role="alert">{error}</p>}
        <div className="mt-8 flex gap-3">
          {!singleSection && step > 0 ? <Button variant="outline" size="lg" onClick={() => { setError(""); setStep((current) => current - 1); }}>Back</Button> : <Button variant="outline" size="lg" onClick={() => backToOverview()}>{singleSection ? "Cancel" : "Back to profile"}</Button>}
          <Button variant="primary" size="lg" fullWidth onClick={handleNext} loading={saving}>{singleSection ? "Save changes" : step === STEPS.length - 1 ? "Finish profile" : "Save & continue"}</Button>
        </div>
        </>}
      </div>
      </main>
    </div>
  );
}
