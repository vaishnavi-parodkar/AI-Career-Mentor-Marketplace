import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Logo from "../components/Logo";
import ProgressBar from "../components/ProgressBar";
import { profileApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STEPS = ["Education", "Interests", "Goals"];

const qualifications = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
];

const interestOptions = [
  "Technology",
  "Business",
  "Design",
  "Healthcare",
  "Data & Analytics",
  "People & HR",
];

const goalOptions = [
  "Land my first job",
  "Switch careers",
  "Get promoted",
  "Explore options",
];

export default function CareerProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    qualification: "",
    field: "",
    gradYear: "",
    interests: [],
    goal: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const saveProfile = async () => {
    setError("");

    if (!user || !user.id) {
      setError("Your login session could not be found. Please log in again.");
      return false;
    }

    const profileData = {
      userId: Number(user.id),
      qualification: form.qualification,
      field: form.field.trim(),
      gradYear: Number(form.gradYear),
      interests: form.interests.join(", "),
      goal: form.goal,
    };

    setSaving(true);

    try {
      const result = await profileApi.saveProfile(profileData);

      if (result && result.success === false) {
        setError(result.message || "Unable to save your profile.");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Profile save error:", err);
      setError("Unable to save your profile. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    setError("");

    if (step === 0) {
      if (!form.qualification || !form.field.trim() || !form.gradYear) {
        setError("Please fill in all fields to continue.");
        return;
      }

      const year = Number(form.gradYear);

      if (year < 2000 || year > 2100) {
        setError("Please enter a valid graduation year.");
        return;
      }
    }

    if (step === 1 && form.interests.length === 0) {
      setError("Select at least one area of interest.");
      return;
    }

    if (step === 2) {
      if (!form.goal) {
        setError("Please select a goal to continue.");
        return;
      }

      const saved = await saveProfile();

      if (saved) {
        navigate("/home");
      }

      return;
    }

    setStep((s) => s + 1);
  };

  const handleSaveExit = async () => {
    const saved = await saveProfile();

    if (saved) {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-app flex h-20 items-center justify-between">
        <Logo to="/" />

        <button
          onClick={handleSaveExit}
          disabled={saving}
          className="text-sm font-semibold text-text-muted hover:text-dark-green disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save & Exit"}
        </button>
      </div>

      <div className="container-app flex justify-center pb-16 pt-2">
        <div className="w-full max-w-lg">
          <h1 className="mb-2 text-center font-heading text-3xl font-bold text-dark-green lg:text-left">
            Let's build your career profile
          </h1>

          <p className="mb-6 text-center text-sm text-text-muted lg:text-left">
            This helps our AI personalize your recommendations.
          </p>

          <div className="mb-8">
            <div className="mb-2 flex justify-between text-xs font-semibold text-text-muted">
              <span>
                Step {step + 1} of {STEPS.length}: {STEPS[step]}
              </span>

              <span>
                {Math.round(((step + 1) / STEPS.length) * 100)}%
              </span>
            </div>

            <ProgressBar value={step + 1} max={STEPS.length} />
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-dark">
                  Higher Qualification
                </label>

                <select
                  value={form.qualification}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      qualification: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-off-white px-4 py-3 text-sm text-text-dark outline-none focus:border-dark-green"
                >
                  <option value="">Select qualification</option>

                  {qualifications.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Field of Study"
                placeholder="e.g. Computer Engineering"
                value={form.field}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    field: e.target.value,
                  }))
                }
              />

              <Input
                label="Graduation Year"
                type="number"
                placeholder="e.g. 2027"
                value={form.gradYear}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    gradYear: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="mb-3 text-sm font-medium text-text-dark">
                Which areas interest you most? (select all that apply)
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                      form.interests.includes(interest)
                        ? "border-dark-green bg-light-sage text-dark-green"
                        : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-3 text-sm font-medium text-text-dark">
                What's your main goal right now?
              </p>

              <div className="flex flex-col gap-3">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        goal,
                      }))
                    }
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      form.goal === goal
                        ? "border-dark-green bg-light-sage text-dark-green"
                        : "border-border bg-off-white text-text-dark hover:bg-light-sage/40"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-coral">
              {error}
            </p>
          )}

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep((s) => s - 1)}
                disabled={saving}
              >
                Back
              </Button>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNext}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : step === STEPS.length - 1
                ? "Finish"
                : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}