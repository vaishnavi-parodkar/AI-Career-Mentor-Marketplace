import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Logo from "../components/Logo";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import authBackground from "../assets/image 1.jpeg";

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
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-sage">Welcome back</p>
              <h2 className="max-w-md font-heading text-4xl font-bold leading-tight text-off-white xl:text-5xl">
                Keep moving toward work that fits you.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-off-white/75">
                Your assessment, career matches, and next steps are waiting for you.
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-off-white/60">Career clarity, one step at a time</p>
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

            <p className="mt-6 text-center text-sm text-text-muted">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-dark-green">
              Create an account
            </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
