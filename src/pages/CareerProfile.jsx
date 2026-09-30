import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import Logo from "../components/Logo";
import ProgressBar from "../components/ProgressBar";
import { profileApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STEPS = ["Education", "Interests", "Goals"];
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

export default function CareerProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ qualification: "", field: "", gradYear: "", interests: [], goal: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [editing, setEditing] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    setVisible(true);
    profileApi.getProfile().then((response) => {
      if (!active) return;
      if (response.success && response.profile) {
        setForm(response.profile);
        setHasProfile(true);
      } else if (response.message && !response.message.toLowerCase().includes("profile not found")) {
        setError(response.message);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const toggleInterest = (interest) => setForm((current) => ({ ...current, interests: current.interests.includes(interest) ? current.interests.filter((item) => item !== interest) : [...current.interests, interest] }));

  const saveProfile = async (redirect = false) => {
    setSaving(true);
    const response = await profileApi.saveProfile(form);
    setSaving(false);
    if (!response.success) {
      setError(response.message || "We could not save your profile. Please try again.");
      return false;
    }
    setHasProfile(true);
    setEditing(false);
    if (redirect) navigate("/home");
    return true;
  };

  const handleNext = async () => {
    setError("");
    if (step === 0 && (!form.qualification || !form.field.trim() || !form.gradYear)) {
      setError("Please fill in all fields to continue.");
      return;
    }
    if (step === 1 && form.interests.length === 0) {
      setError("Select at least one area of interest.");
      return;
    }
    if (step === 2 && !form.goal) {
      setError("Please select a goal to continue.");
      return;
    }
    if (step === 2) {
      await saveProfile(true);
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
        <button type="button" onClick={() => saveProfile(true)} className="focus-ring min-h-11 rounded-full px-4 text-sm font-semibold text-text-muted transition-colors duration-150 hover:bg-light-sage hover:text-dark-green active:scale-[0.98]">Save &amp; exit</button>
      </header>
      <main className={`mx-auto w-full px-4 pb-16 pt-8 transition-opacity duration-500 motion-reduce:transition-none sm:px-6 sm:pt-12 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className={`mx-auto ${hasProfile ? "max-w-3xl" : "max-w-lg"}`}>
        {loading ? <p className="py-16 text-center text-text-muted" role="status">Loading your profile…</p> : hasProfile && !editing ? <>
          <p className="type-eyebrow">Your Pathwise details</p>
          <div className="mt-3 flex items-center gap-4">
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dark-green font-heading text-xl font-bold text-off-white">{profileInitial}</span>
            <h1 className="type-page-title">{profileTitle}</h1>
          </div>
          <Card as="dl" elevated className="mt-9 grid grid-cols-1 gap-x-10 gap-y-7 rounded-2xl border-border/80 p-6 shadow-soft sm:grid-cols-2 sm:p-8 lg:p-9">
            <div className="min-w-0">
              <dt className={fieldLabelClass}>Highest qualification</dt>
              <dd className={fieldValueClass}>{formatValue(form.qualification)}</dd>
            </div>
            <div className="min-w-0">
              <dt className={fieldLabelClass}>Field of study</dt>
              <dd className={fieldValueClass}>{formatValue(form.field)}</dd>
            </div>
            <div className="min-w-0">
              <dt className={fieldLabelClass}>Graduation year</dt>
              <dd className={fieldValueClass}>{form.gradYear}</dd>
            </div>
            <div className="min-w-0">
              <dt className={fieldLabelClass}>Areas of interest</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {form.interests.map((interest) => <span key={interest} className="rounded-full border border-dark-green/10 bg-light-sage px-3 py-1.5 text-sm font-semibold text-dark-green">{formatValue(interest)}</span>)}
              </dd>
            </div>
            <div className="col-span-1 rounded-xl border border-dark-green/10 bg-light-sage/60 px-5 py-4 sm:col-span-2 sm:px-6">
              <dt className={fieldLabelClass}>Main goal</dt>
              <dd className={fieldValueClass}>{formatValue(form.goal)}</dd>
            </div>
          </Card>
          {error && <p className="mt-4 text-sm font-medium text-coral" role="alert">{error}</p>}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg" fullWidth onClick={() => { setError(""); setEditing(true); }}>Edit profile</Button>
            <Button variant="outline" size="lg" fullWidth onClick={() => navigate("/home")}>Back to home</Button>
          </div>
        </> : <>
        <p className="type-eyebrow">A little context helps</p>
        <h1 className="mt-2 type-page-title">{hasProfile ? "Edit your career profile" : "Let’s build your career profile"}</h1>
        <p className="mt-3 type-supporting">This gives your assessment and career exploration more useful context.</p>
        <div className="mb-8 mt-8"><div className="mb-3 flex justify-between text-sm font-semibold text-text-muted"><span>Step {step + 1} of {STEPS.length}: {STEPS[step]}</span><span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span></div><ProgressBar value={step + 1} max={STEPS.length} label="Profile completion" /></div>

        {step === 0 && <div className="flex flex-col gap-5"><div><label htmlFor="qualification" className="mb-2 block text-sm font-semibold text-text-dark">Highest qualification</label><select id="qualification" value={form.qualification} onChange={(e) => setForm((current) => ({ ...current, qualification: e.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-border bg-off-white px-4 py-3 text-base text-text-dark outline-none sm:text-sm"><option value="">Select qualification</option>{qualifications.map((qualification) => <option key={qualification} value={qualification}>{qualification}</option>)}</select></div><Input label="Field of study" placeholder="e.g. Computer Engineering" value={form.field} onChange={(e) => setForm((current) => ({ ...current, field: e.target.value }))} /><Input label="Graduation year" type="number" placeholder="e.g. 2027" value={form.gradYear} onChange={(e) => setForm((current) => ({ ...current, gradYear: e.target.value }))} /></div>}
        {step === 1 && <div><p className="mb-4 text-base font-semibold text-text-dark">Which areas interest you most? <span className="font-normal text-text-muted">Select all that apply.</span></p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{interestOptions.map((interest) => <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`focus-ring min-h-12 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${form.interests.includes(interest) ? "border-dark-green bg-light-sage text-dark-green" : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"}`}>{interest}</button>)}</div></div>}
        {step === 2 && <div><p className="mb-4 text-base font-semibold text-text-dark">What&apos;s your main goal right now?</p><div className="flex flex-col gap-3">{goalOptions.map((goal) => <button key={goal} type="button" onClick={() => setForm((current) => ({ ...current, goal }))} className={`focus-ring min-h-12 rounded-xl border px-4 py-3 text-left text-base font-semibold transition-colors ${form.goal === goal ? "border-dark-green bg-light-sage text-dark-green" : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"}`}>{goal}</button>)}</div></div>}
        {error && <p className="mt-5 text-sm font-medium text-coral" role="alert">{error}</p>}
        <div className="mt-8 flex gap-3">{step > 0 ? <Button variant="outline" size="lg" onClick={() => setStep((current) => current - 1)}>Back</Button> : hasProfile && <Button variant="outline" size="lg" onClick={() => setEditing(false)}>Cancel</Button>}<Button variant="primary" size="lg" fullWidth onClick={handleNext} loading={saving}>{step === STEPS.length - 1 ? "Save profile" : "Continue"}</Button></div>
        </>}
      </div>
      </main>
    </div>
  );
}
