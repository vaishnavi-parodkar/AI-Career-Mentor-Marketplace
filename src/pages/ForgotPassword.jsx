
import { useState } from "react";

import { MailCheck, LockKeyhole } from "lucide-react";

import Input from "../components/Input";

import Button from "../components/Button";

import BackButton from "../components/BackButton";

import Logo from "../components/Logo";

import { authApi } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState("email");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const result = await authApi.forgotPassword(email);

    setLoading(false);

    if (!result.success) {
      setError(result.message || "Unable to process request.");
      return;
    }

    if (!result.token) {
      setError("Unable to generate a password reset token.");
      return;
    }

    // Keep the token on this same page
    setResetToken(result.token);

    // Move to password reset section
    setStep("reset");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const result = await authApi.resetPassword(
      resetToken,
      newPassword
    );

    setLoading(false);

    if (!result.success) {
      setError(result.message || "Unable to reset password.");
      return;
    }

    setSuccess("Password reset successfully.");

    setNewPassword("");
    setConfirmPassword("");

    // Return to email step after successful reset
    setTimeout(() => {
      setStep("email");
      setResetToken("");
      setSuccess("");
    }, 2000);
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

            {step === "email" ? (
              <MailCheck size={34} />
            ) : (
              <LockKeyhole size={34} />
            )}

          </div>

          {step === "email" ? (
            <>
              <h1 className="mb-1 font-heading text-3xl font-bold text-dark-green">
                Forgot Password?
              </h1>

              <p className="mb-8 text-sm text-text-muted">
                Enter your registered email to reset your password.
              </p>

              <form
                onSubmit={handleEmailSubmit}
                className="flex flex-col gap-4 text-left"
              >

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Continue"}
                </Button>

              </form>
            </>
          ) : (
            <>
              <h1 className="mb-1 font-heading text-3xl font-bold text-dark-green">
                Reset Password
              </h1>

              <p className="mb-8 text-sm text-text-muted">
                Create a new password for your account.
              </p>

              <form
                onSubmit={handleResetPassword}
                className="flex flex-col gap-4 text-left"
              >

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={error}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {success && (
                  <p className="text-sm text-green-600">
                    {success}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>

              </form>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

