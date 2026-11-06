import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  type = "text",
  error,
  className = "",
  id,
  ...props
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${inputId}-error`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-text-dark">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={isPassword ? (show ? "text" : "password") : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`min-h-11 w-full rounded-xl border bg-off-white px-4 py-3 text-base text-text-dark outline-none transition-colors placeholder:text-text-muted focus:border-dark-green focus:ring-2 focus:ring-coral/40 sm:text-sm ${
            error ? "border-coral" : "border-border"
          } ${isPassword ? "pr-12" : ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="focus-ring absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-light-sage hover:text-dark-green"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {error && <p id={errorId} className="mt-1.5 text-sm font-medium text-coral" role="alert">{error}</p>}
    </div>
  );
}
