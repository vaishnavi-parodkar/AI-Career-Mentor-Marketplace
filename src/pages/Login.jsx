import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Logo from "../components/Logo";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);
    const res = await authApi.login(form);
    setLoading(false);
    if (res.success) {
      login(res.user);
      navigate("/home");
    } else {
      setFormError(res.message);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const res = await authApi.googleLogin();
    setLoading(false);
    if (res.success) {
      login(res.user);
      navigate("/home");
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
            Welcome Back
          </h1>
          <p className="mb-8 text-center text-sm text-text-muted lg:text-left">
            Login to continue building your career path.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="Your password"
              value={form.password}
              onChange={update("password")}
              error={errors.password}
            />

            <Link to="/forgot-password" className="-mt-1 self-end text-sm font-semibold text-dark-green">
              Forgot Password?
            </Link>

            {formError && <p className="text-sm text-coral">{formError}</p>}

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading} className="mt-1">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" size="lg" fullWidth onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>

          <p className="mt-3 text-center text-xs text-text-muted">
            Demo login: <span className="font-semibold">demo@pathwise.com</span> /{" "}
            <span className="font-semibold">demo1234</span>
          </p>

          <p className="mt-6 text-center text-sm text-text-muted">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-dark-green">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
