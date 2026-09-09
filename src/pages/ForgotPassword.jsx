import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Logo from "../components/Logo";
import { authApi } from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    await authApi.forgotPassword(email);
    setLoading(false);
    navigate("/reset-password");
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
            <MailCheck size={34} />
          </div>
          <h1 className="mb-1 font-heading text-3xl font-bold text-dark-green">Forgot Password?</h1>
          <p className="mb-8 text-sm text-text-muted">
            Enter your registered email and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
