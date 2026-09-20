import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Logo from "../components/Logo";
import ProgressBar from "../components/ProgressBar";
import { profileApi } from "../services/api";

const STEPS = ["Education", "Interests", "Goals"];
const qualifications = ["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD"];
const interestOptions = ["Technology", "Business", "Design", "Healthcare", "Data & Analytics", "People & HR"];
const goalOptions = ["Land my first job", "Switch careers", "Get promoted", "Explore options"];

export default function CareerProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ qualification: "", field: "", gradYear: "", interests: [], goal: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest) => setForm((current) => ({ ...current, interests: current.interests.includes(interest) ? current.interests.filter((item) => item !== interest) : [...current.interests, interest] }));

  const saveProfile = async (redirect = false) => {
    setSaving(true);
    const response = await profileApi.saveProfile(form);
    setSaving(false);
    if (!response.success) {
      setError(response.message || "We could not save your profile. Please try again.");
      return false;
    }
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

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-app flex h-20 items-center justify-between"><Logo to="/" /><button type="button" onClick={() => saveProfile(true)} className="focus-ring min-h-10 rounded-full px-3 text-sm font-semibold text-text-muted hover:text-dark-green">Save & exit</button></div>
      <div className="container-app flex justify-center pb-16 pt-4"><div className="w-full max-w-lg">
        <p className="type-eyebrow">A little context helps</p>
        <h1 className="mt-2 type-page-title">Let&apos;s build your career profile</h1>
        <p className="mt-3 type-supporting">This gives your assessment and career exploration more useful context.</p>
        <div className="mb-8 mt-8"><div className="mb-3 flex justify-between text-sm font-semibold text-text-muted"><span>Step {step + 1} of {STEPS.length}: {STEPS[step]}</span><span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span></div><ProgressBar value={step + 1} max={STEPS.length} label="Profile completion" /></div>

        {step === 0 && <div className="flex flex-col gap-5"><div><label htmlFor="qualification" className="mb-2 block text-sm font-semibold text-text-dark">Highest qualification</label><select id="qualification" value={form.qualification} onChange={(e) => setForm((current) => ({ ...current, qualification: e.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-border bg-off-white px-4 py-3 text-base text-text-dark outline-none sm:text-sm"><option value="">Select qualification</option>{qualifications.map((qualification) => <option key={qualification} value={qualification}>{qualification}</option>)}</select></div><Input label="Field of study" placeholder="e.g. Computer Engineering" value={form.field} onChange={(e) => setForm((current) => ({ ...current, field: e.target.value }))} /><Input label="Graduation year" type="number" placeholder="e.g. 2027" value={form.gradYear} onChange={(e) => setForm((current) => ({ ...current, gradYear: e.target.value }))} /></div>}
        {step === 1 && <div><p className="mb-4 text-base font-semibold text-text-dark">Which areas interest you most? <span className="font-normal text-text-muted">Select all that apply.</span></p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{interestOptions.map((interest) => <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`focus-ring min-h-12 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${form.interests.includes(interest) ? "border-dark-green bg-light-sage text-dark-green" : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"}`}>{interest}</button>)}</div></div>}
        {step === 2 && <div><p className="mb-4 text-base font-semibold text-text-dark">What&apos;s your main goal right now?</p><div className="flex flex-col gap-3">{goalOptions.map((goal) => <button key={goal} type="button" onClick={() => setForm((current) => ({ ...current, goal }))} className={`focus-ring min-h-12 rounded-xl border px-4 py-3 text-left text-base font-semibold transition-colors ${form.goal === goal ? "border-dark-green bg-light-sage text-dark-green" : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"}`}>{goal}</button>)}</div></div>}
        {error && <p className="mt-5 text-sm font-medium text-coral" role="alert">{error}</p>}
        <div className="mt-8 flex gap-3">{step > 0 && <Button variant="outline" size="lg" onClick={() => setStep((current) => current - 1)}>Back</Button>}<Button variant="primary" size="lg" fullWidth onClick={handleNext} loading={saving}>{step === STEPS.length - 1 ? "Finish profile" : "Continue"}</Button></div>
      </div></div>
    </div>
  );
}
