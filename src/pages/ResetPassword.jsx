import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Logo from "../components/Logo";
import { authApi } from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await authApi.resetPassword(form.password);
    setLoading(false);
    setDone(true);
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-app flex h-20 items-center justify-between">
        <BackButton to="/login" />
        <Logo to="/" />
        <div className="w-10" />
      </div>

      <div className="container-app flex justify-center pb-16 pt-2">
        <div className="w-full max-w-md text-center lg:text-left">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-light-sage text-dark-green lg:mx-0">
            <KeyRound size={34} />
          </div>
          <h1 className="mb-1 font-heading text-3xl font-bold text-dark-green">Reset Password</h1>
          <p className="mb-8 text-sm text-text-muted">Choose a new password for your account.</p>

          {done ? (
            <p className="rounded-xl bg-light-sage px-4 py-3 text-sm font-semibold text-dark-green">
              Password reset! Redirecting to login...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={update("password")}
                error={errors.password}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter new password"
                value={form.confirm}
                onChange={update("confirm")}
                error={errors.confirm}
              />
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
