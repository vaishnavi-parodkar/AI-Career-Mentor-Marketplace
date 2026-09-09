import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Logo from "../components/Logo";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
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
    <div className="min-h-screen bg-cream">
      <div className="container-app flex h-20 items-center justify-between">
        <BackButton to="/" />
        <Logo to="/" />
        <div className="w-10" />
      </div>

      <div className="container-app flex justify-center pb-16 pt-2">
        <div className="w-full max-w-md">
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
              placeholder="At least 6 characters"
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
  );
}
