import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Logo from "../components/Logo";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import authBackground from "../assets/image 1.jpeg";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match.";
    if (!agree) errs.agree = "You must accept the Terms & Conditions.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);
    const res = await authApi.signup(form);
    setLoading(false);
    if (res.success) {
      login(res.user);
      navigate("/profile");
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-border bg-off-white shadow-soft sm:min-h-[calc(100vh-4rem)]">
        <div className="relative hidden w-1/2 overflow-hidden bg-dark-green lg:block">
          <img
            src={authBackground}
            alt="Abstract colorful marbled artwork"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-dark-green/65" />
          <div className="relative flex h-full flex-col justify-between p-10 text-off-white xl:p-14">
            <Logo to="/" className="[&>span:last-child]:text-off-white" />
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-sage">Your next chapter starts here</p>
              <h2 className="max-w-md font-heading text-4xl font-bold leading-tight text-off-white xl:text-5xl">
                Welcome to a clearer way forward.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-off-white/75">
                Build your profile, discover your strongest career matches, and turn curiosity into a plan.
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-off-white/60">Pathwise career guidance</p>
          </div>
        </div>

        <div className="flex w-full flex-col lg:w-1/2">
          <div className="flex items-center justify-between p-5 sm:p-8">
            <BackButton to="/" />
            <div className="lg:hidden"><Logo to="/" /></div>
            <div className="w-10 lg:hidden" />
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-8 sm:px-10 sm:pb-12">
            <h1 className="mb-1 text-center font-heading text-3xl font-bold text-dark-green lg:text-left">
              Create Account
            </h1>
            <p className="mb-8 text-center text-sm text-text-muted lg:text-left">
              Start your journey to a career that fits you.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              placeholder="Jordan Lee"
              value={form.fullName}
              onChange={update("fullName")}
              error={errors.fullName}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={update("password")}
              error={errors.password}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirm}
              onChange={update("confirm")}
              error={errors.confirm}
            />

            <label className="flex items-start gap-2.5 pt-1 text-sm text-text-dark">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-[#064C3B]"
              />
              <span>
                I agree to the <span className="font-semibold text-dark-green">Terms & Conditions</span> and{" "}
                <span className="font-semibold text-dark-green">Privacy Policy</span>.
              </span>
            </label>
            {errors.agree && <p className="-mt-2 text-xs text-coral">{errors.agree}</p>}

            {formError && <p className="text-sm text-coral">{formError}</p>}

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading} className="mt-2">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-dark-green">
              Login
            </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
