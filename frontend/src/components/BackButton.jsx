import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to, className = "" }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-border bg-off-white text-dark-green transition-colors hover:bg-light-sage ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft size={18} aria-hidden="true" />
    </button>
  );
}
